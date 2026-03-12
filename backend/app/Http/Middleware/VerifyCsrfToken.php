<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        '/api/skins',
        '/api/builds',
        '/api/mods',
        '/api/seeds',
        '/api/login',
        '/api/register',
        '/api/admin/*',
        '/api/quizzes/submit',
    ];
}
