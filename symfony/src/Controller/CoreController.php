<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class CoreController extends AbstractController
{
    /**
     * This is the main entry point of the application and used to check if the application is up and running like /ping
     */
    #[Route('/', name: 'app', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json(['success' => true], 200);
    }
}