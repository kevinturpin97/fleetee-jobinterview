<?php

namespace App\DataFixtures;

use App\Entity\Genre;
use App\Entity\User;
use App\Entity\UserFilm;
use App\Entity\UserTVShow;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Class AppFixtures
 * @package App\DataFixtures
 * 
 * /!\ DO NOT USE IN PRODUCTION /!\
 * Some data fixtures to populate the database with some demo data
 * user: demo@test.fr / password: demo
 */
class AppFixtures extends Fixture
{
    private array $TVGenres = [
        ["tmdb_id" => 10759, "name" => "Action & Aventure"],
        ["tmdb_id" => 16, "name" => "Animation"],
        ["tmdb_id" => 35, "name" => "Comédie"],
        ["tmdb_id" => 80, "name" => "Crime"],
        ["tmdb_id" => 99, "name" => "Documentaire"],
        ["tmdb_id" => 18, "name" => "Drame"],
        ["tmdb_id" => 10751, "name" => "Famille"],
        ["tmdb_id" => 10762, "name" => "Enfants"],
        ["tmdb_id" => 9648, "name" => "Mystère"],
        ["tmdb_id" => 10763, "name" => "Actualités"],
        ["tmdb_id" => 10764, "name" => "Réalité"],
        ["tmdb_id" => 10765, "name" => "Science-Fiction & Fantaisie"],
        ["tmdb_id" => 10766, "name" => "Feuilleton"],
        ["tmdb_id" => 10767, "name" => "Talk-Show"],
        ["tmdb_id" => 10768, "name" => "Guerre & Politique"],
        ["tmdb_id" => 37, "name" => "Western"]
    ];
    
    private array $filmGenres = [
        ["tmdb_id" => 28, "name" => "Action"],
        ["tmdb_id" => 12, "name" => "Aventure"],
        ["tmdb_id" => 16, "name" => "Animation"],
        ["tmdb_id" => 35, "name" => "Comédie"],
        ["tmdb_id" => 80, "name" => "Crime"],
        ["tmdb_id" => 99, "name" => "Documentaire"],
        ["tmdb_id" => 18, "name" => "Drame"],
        ["tmdb_id" => 10751, "name" => "Famille"],
        ["tmdb_id" => 14, "name" => "Fantaisie"],
        ["tmdb_id" => 36, "name" => "Histoire"],
        ["tmdb_id" => 27, "name" => "Horreur"],
        ["tmdb_id" => 10402, "name" => "Musique"],
        ["tmdb_id" => 9648, "name" => "Mystère"],
        ["tmdb_id" => 10749, "name" => "Romance"],
        ["tmdb_id" => 878, "name" => "Science-Fiction"],
        ["tmdb_id" => 10770, "name" => "Téléfilm"],
        ["tmdb_id" => 53, "name" => "Thriller"],
        ["tmdb_id" => 10752, "name" => "Guerre"],
        ["tmdb_id" => 37, "name" => "Western"]
    ];

    public function load(ObjectManager $manager): void
    {
        // load static data first
        $this->loadGenres($manager);

        // retrieve static data
        $genreRepository = $manager->getRepository(Genre::class);
        $genres = $genreRepository->findAll();
        
        // then load others entities
        $this->loadDemoAccount($manager);

        $users = $manager->getRepository(User::class)->findAll();
        $user = reset($users);

        $this->loadDemoDataFilm($manager, $user, $genres);
        $this->loadDemoDataTV($manager, $user, $genres);
    }

    private function loadDemoAccount(ObjectManager $manager): void
    {
        $demoAccount = new User();
        
        $demoAccount
            ->setUid(uniqid())
            ->setEmail('demo@test.fr')
            ->setPassword(password_hash('demo', PASSWORD_DEFAULT));

        $manager->persist($demoAccount);
        $manager->flush();
    }

    private function loadGenres(ObjectManager $manager): void
    {
        foreach ($this->TVGenres as $tvg) {
            $genre = new Genre();
            
            $genre
                ->setTmdbId($tvg['tmdb_id'])
                ->setName($tvg['name']);
            
            $manager->persist($genre);
        }

        foreach ($this->filmGenres as $fg) {
            $genre = new Genre();
            
            $genre
                ->setTmdbId($fg['tmdb_id'])
                ->setName($fg['name']);
            
            $manager->persist($genre);
        }

        $manager->flush();
    }

    private function loadDemoDataFilm(ObjectManager $manager, User $user, array $genres): void
    {
        $userFilm = new UserFilm();

        $userFilm
            ->setUser($user)
            ->setTmdbId(150540)
            ->setName('Inside Out')
            ->setDuration(95)
            ->setPicture('/j29ekbcLpBvxnGk6LjdTc2EI5SA.jpg')
            ->setThumbnail('/lRHE0vzf3oYJrhbsHXjIkF4Tl5A.jpg');

        foreach ($genres as $genre) {
            if (!in_array($genre->getTmdbId(), [16, 10751, 12, 18, 35])) { continue; }

            $userFilm->addGenre($genre);
        }

        $manager->persist($userFilm);
        $manager->flush();
    }

    private function loadDemoDataTV(ObjectManager $manager, User $user, array $genres): void
    {
        $userTVShow = new UserTVShow();

        $userTVShow
            ->setUser($user)
            ->setTmdbId(1622)
            ->setName('Supernatural')
            ->setPicture('/nVRyd8hlg0ZLxBn9RaI7mUMQLnz.jpg')
            ->setThumbnail('/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg')
            ->setSeason(3)
            ->setDuration(45)
            ->setEpisode(2)
            ->setAverageEpisode(7.8);

        foreach ($genres as $genre) {
            if (!in_array($genre->getTmdbId(), [18, 9648, 10765])) { continue; }

            $userTVShow->addGenre($genre);
        }

        $manager->persist($userTVShow);
        $manager->flush();
    }
}
