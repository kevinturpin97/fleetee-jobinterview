<?php

namespace App\Controller;

use App\Entity\Genre;
use App\Entity\User;
use App\Entity\UserTVShow;

use App\Security\Authentication;
use App\Service\TMDB;

use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class TVShowController extends AbstractController
{
    #[Route('/tv', name: 'app_tv_show', methods: ['GET'])]
    public function index(ManagerRegistry $doctrine): JsonResponse
    {
        $genres = $doctrine->getRepository(Genre::class)->findAll();
        $tmdb = new TMDB();

        $results = $tmdb->get('tv/airing_today');
        $lastTVShows = $results['results'];
        $cleanedTVShows = array_map(function ($tvShow) use ($genres) {
            return [
                'id' => $tvShow['id'],
                'name' => $tvShow['name'],
                'picture' => $tvShow['backdrop_path'],
                'thumbnail' => $tvShow['poster_path'],
                'release_date' => $tvShow['first_air_date'],
                'overview' => $tvShow['overview'],
                'genres' => array_map(function ($genreId) use ($genres) {
                    foreach ($genres as $genre) {
                        if ($genre->getTmdbId() === $genreId) {
                            return $genre->getName();
                        }
                    }
                }, $tvShow['genre_ids'])
            ];
        }, $lastTVShows);

        return $this->json($cleanedTVShows, 200);
    }

    #[Route('/tv/search', name: 'app_tv_show_search', methods: ['GET'])]
    public function search(ManagerRegistry $doctrine, Request $request): JsonResponse
    {
        $query = $request->query->get('query') ?? '';

        if (!$query) {
            return $this->json(['success' => false, 'message' => 'Query parameter is required'], 400);
        }

        $genres = $doctrine->getRepository(Genre::class)->findAll();
        $tmdb = new TMDB();

        $results = $tmdb->get('search/tv', ['query' => $query]);
        $searchedTVShows = $results['results'];
        $cleanedTVShows = array_map(function ($tvShow) use ($genres) {
            return [
                'id' => $tvShow['id'],
                'name' => $tvShow['name'],
                'picture' => $tvShow['backdrop_path'],
                'thumbnail' => $tvShow['poster_path'],
                'release_date' => $tvShow['first_air_date'],
                'overview' => $tvShow['overview'],
                'genres' => array_map(function ($genreId) use ($genres) {
                    foreach ($genres as $genre) {
                        if ($genre->getTmdbId() === $genreId) {
                            return $genre->getName();
                        }
                    }
                }, $tvShow['genre_ids'])
            ];
        }, $searchedTVShows);

        return $this->json($cleanedTVShows, 200);
    }

    /**
     * Process:
     * - get current tv show from user in database
     * - get tv show from TMDB API with the tmdbid
     * - return cleaned tv show
     */
    #[Route('/tv/{id}', name: 'app_tv_show_show', methods: ['GET'])]
    public function show(#[CurrentUser] ?User $user, ManagerRegistry $doctrine, int $id): JsonResponse
    {
        Authentication::needToBeLogged($user);

        $tvRepository = $doctrine->getRepository(UserTVShow::class);
        $userTvShow = $tvRepository->findOneBy(['user' => $user, 'id' => $id]);

        if (!$userTvShow) {
            return $this->json(['success' => false, 'message' => 'TV Show not found'], 404);
        }

        $tmdb = new TMDB();

        $tvShow = $tmdb->get('tv/' . $userTvShow->getTmdbId());
        $cleanedTVShow = [
            'id' => $tvShow['id'],
            'name' => $tvShow['name'],
            'picture' => $tvShow['backdrop_path'],
            'thumbnail' => $tvShow['poster_path'],
            'release_date' => $tvShow['first_air_date'],
            'overview' => $tvShow['overview'],
            'seasons' => $tvShow['number_of_seasons'],
            'genres' => array_map(function ($genre) {
                return $genre['name'];
            }, $tvShow['genres'])
        ];

        $cleanedTVShow['episodes'] = $cleanedTVShow['seasons'] > 0 ? round($tvShow['number_of_episodes'] / $cleanedTVShow['seasons']) : $tvShow['number_of_episodes'];

        return $this->json($cleanedTVShow, 200);
    }
}
