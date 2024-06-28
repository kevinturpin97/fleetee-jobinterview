<?php

namespace App\Controller;

use App\Entity\Genre;

use App\Service\TMDB;

use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class FilmController extends AbstractController
{
    #[Route('/film', name: 'app_film', methods: ['GET'])]
    public function index(ManagerRegistry $doctrine): JsonResponse
    {
        $genres = $doctrine->getRepository(Genre::class)->findAll();
        $tmdb = new TMDB();

        $results = $tmdb->get('movie/now_playing');
        $lastFilms = $results['results'];
        $cleanedFilms = array_map(function ($film) use ($genres) {
            return [
                'id' => $film['id'],
                'name' => $film['title'],
                'picture' => $film['backdrop_path'],
                'thumbnail' => $film['poster_path'],
                'release_date' => $film['release_date'],
                'overview' => $film['overview'],
                'genres' => array_map(function ($genreId) use ($genres) {
                    foreach ($genres as $genre) {
                        if ($genre->getTmdbId() === $genreId) {
                            return $genre->getName();
                        }
                    }
                }, $film['genre_ids'])
            ];
        }, $lastFilms);

        return $this->json($cleanedFilms, 200);
    }

    #[Route('/film/search', name: 'app_film_search', methods: ['GET'])]
    public function search(ManagerRegistry $doctrine, Request $request): JsonResponse
    {
        $query = $request->query->get('query') ?? '';

        if (!$query) {
            return $this->json(['success' => false, 'message' => 'Query parameter is required'], 400);
        }

        $genres = $doctrine->getRepository(Genre::class)->findAll();
        $tmdb = new TMDB();

        $results = $tmdb->get('search/movie', ['query' => $query]);
        $searchedFilms = $results['results'];
        $cleanedFilms = array_map(function ($film) use ($genres) {
            return [
                'id' => $film['id'],
                'name' => $film['title'],
                'picture' => $film['backdrop_path'],
                'thumbnail' => $film['poster_path'],
                'release_date' => $film['release_date'],
                'overview' => $film['overview'],
                'genres' => array_map(function ($genreId) use ($genres) {
                    foreach ($genres as $genre) {
                        if ($genre->getTmdbId() === $genreId) {
                            return $genre->getName();
                        }
                    }
                }, $film['genre_ids'])
            ];
        }, $searchedFilms);

        return $this->json($cleanedFilms, 200);
    }
}
