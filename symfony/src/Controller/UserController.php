<?php

namespace App\Controller;

use App\Entity\Genre;
use App\Entity\User;
use App\Entity\UserFilm;
use App\Entity\UserTVShow;

use App\Security\Authentication;
use App\Service\TMDB;

use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class UserController extends AbstractController
{
    /**
     *  Managed by LexikJWTAuthenticationBundle (can be intercepted with a middleware or a listener)
     *  - App\Security\Authentication::class
     */
    #[Route('/login', name: 'app_user_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user)
    {
        Authentication::needToNotBeLogged($user);
    }

    #[Route('/register', name: 'app_user_register', methods: ['POST'])]
    public function register(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToNotBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        // check if data is valid and not empty (email, password, confirm_password)
        // FEATURE: check types
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $confirmPassword = $data['confirm_password'] ?? null;

        if (!$email || !$password || !$confirmPassword) {
            return $this->json(['success' => false, 'message' => 'Email and password are required'], 400);
        }

        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return $this->json(['success' => false, 'message' => 'Invalid email address'], 400);
        }

        if (strlen($password) < 8) {
            return $this->json(['success' => false, 'message' => 'Password must be at least 8 characters long'], 400);
        }

        if ($password !== $confirmPassword) {
            return $this->json(['success' => false, 'message' => 'Passwords do not match'], 400);
        }

        $userRepository = $doctrine->getRepository(User::class);
        $existingUser = $userRepository->findOneBy(['email' => $email]);

        if ($existingUser) {
            return $this->json(['success' => false, 'message' => 'Email address already in use'], 400);
        }

        $user = new User();
        $user
            ->setUid(uniqid())
            ->setEmail($email)
            ->setPassword(password_hash($password, PASSWORD_DEFAULT));

        try {
            $doctrine->getManager()->persist($user);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'User created'], 201);
    }

    #[Route('/logout', name: 'app_user_logout', methods: ['POST'])]
    public function logout(#[CurrentUser] ?User $user, TokenStorageInterface $tokenStorage): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $tokenStorage->setToken(null);

        return $this->json(['message' => 'Logged out'], 200);
    }

    #[Route('/user/profile', name: 'app_user_profile', methods: ['GET'])]
    public function profile(#[CurrentUser] ?User $user): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $filmsDuration = array_reduce($user->getUserFilms()->toArray(), fn ($acc, $film) => $acc + $film->getDuration(), 0);
        $tvShowsDuration = array_reduce($user->getUserTVShows()->toArray(), function ($acc, $tvShow) {
            // calculate total duration for this season
            $totalForThisSeason = $tvShow->getDuration() * $tvShow->getEpisode();
            // calculate total duration for all seasons except the current one
            $totalTVShowDuration = $tvShow->getDuration() * $tvShow->getAverageEpisode() * ($tvShow->getSeason() - 1);

            // add to previous total
            return $acc + $totalForThisSeason + $totalTVShowDuration;
        }, 0); // 0 is the initial value

        $totalDuration = $filmsDuration + $tvShowsDuration;
        $totalHours = floor($totalDuration / 60);
        $totalMinutes = $totalDuration % 60;

        $stats = [
            'total_hours' => $totalHours,
            'total_minutes' => $totalMinutes,
            'total_films' => count($user->getUserFilms()),
            'total_tv_shows' => count($user->getUserTVShows()),
            'convert_book_reading' => round($totalDuration / 330, 1), // average book reading 300 pages = 330 minutes = 5h30
            'convert_sport' => round($totalDuration / 60, 1), // average sport 1 hour
        ];

        return $this->json($stats, 200);
    }

    #[Route('/user/film', name: 'app_user_film', methods: ['GET'])]
    public function getUserFilms(#[CurrentUser] ?User $user): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $formattedFilms = array_map((fn ($film) => $film->toPublicArray()), $user->getUserFilms()->toArray());

        return $this->json($formattedFilms, 200);
    }

    /**
     * Process for POST, PUT and DELETE requests:
     * - check if user is logged
     * - check if data is provided
     * - check if film/tv already exists
     * - [get film/tv data from TMDB] (if POST)
     * - [create film/tv entity] (if POST)
     * - [update film/tv entity] (if PUT)
     * - [delete film/tv entity] (if DELETE)
     * - persist and flush
     */

    #[Route('/user/film', name: 'app_user_film_add', methods: ['POST'])]
    public function addUserFilm(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        $id = $data['id'] ?? null;

        if (!$id) {
            return $this->json(['success' => false, 'message' => 'ID is required'], 400);
        }

        $filmRepository = $doctrine->getRepository(UserFilm::class);
        $existingFilm = $filmRepository->findOneBy(['tmdb_id' => $id, 'user' => $user]);

        if ($existingFilm) {
            return $this->json(['success' => false, 'message' => 'Film already added'], 400);
        }

        $tmdb = new TMDB();

        try {
            $filmData = $tmdb->get('movie/' . $id);
        } catch (\Exception $e) {
            return $this->json(['success' => false, 'message' => 'Film not found'], 404);
        }

        $film = new UserFilm();
        $genres = $doctrine->getRepository(Genre::class)->findAll();

        // add film to user using static returned data
        $film
            ->setUser($user)
            ->setName($filmData['title'])
            ->setDuration($filmData['runtime'])
            ->setTmdbId($filmData['id'])
            ->setThumbnail($filmData['poster_path'])
            ->setPicture($filmData['backdrop_path']);

        foreach ($filmData['genres'] as $genre) {
            // array_search ~= binary search (O(log n))
            $tmp = array_search($genre['id'], array_column($genres, 'tmdb_id'));

            if ($tmp === false) {
                continue;
            }

            $film->addGenre($genres[$tmp]);
        }

        try {
            $doctrine->getManager()->persist($film);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'Film added'], 201);
    }

    #[Route('/user/film', name: 'app_user_film_delete', methods: ['DELETE'])]
    public function deleteUserFilm(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        $id = $data['id'] ?? null;

        if (!$id) {
            return $this->json(['success' => false, 'message' => 'ID is required'], 400);
        }

        $filmRepository = $doctrine->getRepository(UserFilm::class);
        $film = $filmRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$film) {
            return $this->json(['success' => false, 'message' => 'Film not found'], 404);
        }

        try {
            $doctrine->getManager()->remove($film);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'Film deleted'], 204);
    }

    #[Route('/user/tv', name: 'app_user_tv_show', methods: ['GET'])]
    public function getUserTVShows(#[CurrentUser] ?User $user): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $formattedTVShows = array_map((fn ($tvShow) => $tvShow->toPublicArray()), $user->getUserTVShows()->toArray());

        return $this->json($formattedTVShows, 200);
    }

    #[Route('/user/tv', name: 'app_user_tv_show_add', methods: ['POST'])]
    public function addUserTVShow(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        $id = $data['id'] ?? null;
        $season = $data['season'] ?? null;
        $episode = $data['episode'] ?? null;

        if (!$id || !$season || !$episode) {
            return $this->json(['success' => false, 'message' => 'ID, season and episode are required'], 400);
        }

        $tvShowRepository = $doctrine->getRepository(UserTVShow::class);
        $existingTVShow = $tvShowRepository->findOneBy(['tmdb_id' => $id, 'user' => $user]);

        if ($existingTVShow) {
            return $this->json(['success' => false, 'message' => 'TV show already added'], 400);
        }

        $tmdb = new TMDB();

        try {
            $tvShowData = $tmdb->get('tv/' . $id);
        } catch (\Exception $e) {
            return $this->json(['success' => false, 'message' => 'TV show not found'], 404);
        }

        if ((int)$season > count($tvShowData['seasons'])) {
            return $this->json(['success' => false, 'message' => 'Season not found'], 404);
        }

        if ((int)$episode > $tvShowData['seasons'][$season - 1]['episode_count']) {
            return $this->json(['success' => false, 'message' => 'Episode not found'], 404);
        }

        $tvShow = new UserTVShow();
        $genres = $doctrine->getRepository(Genre::class)->findAll();

        $tvShow
            ->setUser($user)
            ->setName($tvShowData['name'])
            // calculate average duration for an episode
            ->setDuration(array_reduce($tvShowData['episode_run_time'], fn ($acc, $time) => $acc + $time, 0) / count($tvShowData['episode_run_time']))
            ->setTmdbId($tvShowData['id'])
            ->setThumbnail($tvShowData['poster_path'])
            // force cast to int
            ->setSeason((int)$season)
            ->setEpisode((int)$episode)
            ->setPicture($tvShowData['backdrop_path']);

        foreach ($tvShowData['genres'] as $genre) {
            $tmp = array_search($genre['id'], array_column($genres, 'tmdb_id'));

            if ($tmp === false) {
                continue;
            }

            $tvShow->addGenre($genres[$tmp]);
        }

        try {
            $doctrine->getManager()->persist($tvShow);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'TV show added'], 201);
    }

    #[Route('/user/tv', name: 'app_user_tv_show_update', methods: ['PUT'])]
    public function updateUserTVShow(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        $id = $data['id'] ?? null;
        $season = $data['season'] ?? null;
        $episode = $data['episode'] ?? null;

        if (!$id || !$season || !$episode) {
            return $this->json(['success' => false, 'message' => 'ID, season and episode are required'], 400);
        }

        $tvShowRepository = $doctrine->getRepository(UserTVShow::class);
        $tvShow = $tvShowRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$tvShow) {
            return $this->json(['success' => false, 'message' => 'TV show not found'], 404);
        }

        $tvShow
            ->setSeason((int)$season)
            ->setEpisode((int)$episode);

        try {
            $doctrine->getManager()->persist($tvShow);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'TV show updated'], 200);
    }

    #[Route('/user/tv', name: 'app_user_tv_show_delete', methods: ['DELETE'])]
    public function deleteUserTVShow(#[CurrentUser] ?User $user, Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $data = json_decode($request->getContent(), true);

        if (count($data) === 0) {
            return $this->json(['success' => false, 'message' => 'No data provided'], 400);
        }

        $id = $data['id'] ?? null;

        if (!$id) {
            return $this->json(['success' => false, 'message' => 'ID is required'], 400);
        }

        $tvShowRepository = $doctrine->getRepository(UserTVShow::class);
        $tvShow = $tvShowRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$tvShow) {
            return $this->json(['success' => false, 'message' => 'TV show not found'], 404);
        }

        try {
            $doctrine->getManager()->remove($tvShow);
            $doctrine->getManager()->flush();
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return $this->json(['success' => false, 'message' => 'Something went wrong'], 500);
        }

        return $this->json(['message' => 'TV show deleted'], 204);
    }
}
