<?php

namespace App\Middleware;

use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class MainMiddleware implements EventSubscriberInterface {
    
    public function __construct(private ManagerRegistry $doctrine, private JWTEncoderInterface $jwtEncoder, private TokenStorageInterface $tokenStorage) {
        $this->jwtEncoder = $jwtEncoder;
        $this->doctrine = $doctrine;
        $this->tokenStorage = $tokenStorage;
    }

    public function onKernelRequest(RequestEvent $event) {
        $request = $event->getRequest();
        $token = $request->headers->get('Authorization');

        // if token is provided we try to authenticate the user
        if ($token) {
            if (strpos($token, 'Bearer ') === 0) {
                $token = substr($token, 7);
            } else {
                $this->output('Invalid token format', 401);
            }

            try {
                $data = $this->jwtEncoder->decode($token);
            } catch (JWTDecodeFailureException $e) {
                $this->output('Invalid token', 401);
            }

            if (!$data) {
                $this->output('Invalid token', 401);
            }

            $user = $this->doctrine->getRepository(User::class)->findOneBy(['email' => $data['username']]);

            if (!$user) {
                $this->output('User not found', 401);
            }

            // if the user is found we authenticate him
            $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

            $this->tokenStorage->setToken($token);
        }
    }

    private function output(string $message, int $code = 400) {
        $response = new JsonResponse(['success' => false, 'message' => $message], $code);
        $response->send();
        die();
    }

    /**
     * Subscribe to every request made to the application
     * FEATURE: subscribe to kernel.exception and return some customs errors or logs in the database
     */
    public static function getSubscribedEvents(): array
    {
        return [
            'kernel.request' => 'onKernelRequest',
        ];
    }
}