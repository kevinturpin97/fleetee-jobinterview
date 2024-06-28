<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

class Authentication implements AuthenticationSuccessHandlerInterface, AuthenticationFailureHandlerInterface {

    public function __construct(private JWTEncoderInterface $jwtEncoder)
    {
        $this->jwtEncoder = $jwtEncoder;
    }

    /**
     * Below every function that is used to handle the success or failure of the authentication from JWT
     */

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): JsonResponse
    {
        $user = $token->getUser();
        $token = $this->jwtEncoder->encode(['username' => $user->getUserIdentifier()]);

        return new JsonResponse(['token' => $token]);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): JsonResponse
    {
        return $this->output('Authentication failed', 401, false);
    }

    /**
     * Below every static function that is used to check if the user is logged in or not, roles, etc.
     */

    public static function needToBeLogged(?User $user)
    {
        if ($user === null) {
            self::output('You need to be logged in', 401);
        } 
    }

    public static function needToBeAdmin(?User $user)
    {
        if (!self::needToBeLogged($user) || !in_array('ROLE_ADMIN', $user->getRoles())) {
            self::output('You need to be an admin', 403);
        }
    }

    public static function needToBeUser(?User $user)
    {
        if (!self::needToBeLogged($user) || !in_array('ROLE_USER', $user->getRoles())) {
            self::output('You need to be a user', 403);
        }
    }

    public static function needToNotBeLogged(?User $user)
    {
        if ($user !== null) {
            self::output('You need to be logged out', 403);
        }
    }

    private static function output(string $message, int $code = 400, bool $die = true): ?JsonResponse
    {
        $response = new JsonResponse(['success' => false, 'message' => $message], $code);
        
        if ($die) {
            $response->send();
            die();
        } else {
            return $response;
        }
    }
}