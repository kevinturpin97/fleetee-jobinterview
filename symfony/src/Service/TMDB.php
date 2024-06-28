<?php

namespace App\Service;

/**
 * Class TMDB
 * @package App\Service
 * 
 * This class is used to fetch data from The Movie Database API
 * Internal fetch permits to avoid the use of the API key in the front-end
 */
class TMDB {
    private array $headers = [];

    public function __construct() {
        $this->headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $_ENV['TMDB_TOKEN']
        ];
    }

    public function get(string $query, ?array $params = []): array 
    {
        $cleanParams = '';

        // Check if the parameters are valid
        if ($params) {
            $validParams = [
                'page',
                'query',
                'region',
                'year',
            ];

            foreach ($params as $key => $_) {
                if (!in_array($key, $validParams)) {
                    throw new \Exception('Invalid parameter');
                }
            }

            $cleanParams = http_build_query($params);
        }
        
        $url = 'https://api.themoviedb.org/3/' . $query . '?api_key=' . $_ENV['TMDB_API_KEY'] . '&language=fr-FR&timezone=Europe%2FParis' . ($cleanParams ? '&' . $cleanParams : '');
        
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        try {
            $response = curl_exec($ch);
        } catch (\Exception $e) {
            error_log($e->getMessage());

            throw new \Exception('Error while fetching data');
        }
        
        curl_close($ch);

        return json_decode($response, true);
    }
}