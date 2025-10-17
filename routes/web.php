<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChiffrageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Page d'accueil
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard principal : redirige selon rôle
Route::get('/dashboard', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login');
    }

    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('user.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Dashboard Admin sécurisé avec Gate
Route::get('/admin/dashboard', function () {
    $user = auth()->user();

    return Inertia::render('Admin/Dashboard', [
        'auth' => [
            'user' => $user
        ]
    ]);
})->middleware(['auth', 'verified', 'can:isAdmin'])->name('admin.dashboard');

// Dashboard User sécurisé avec Gate
Route::get('/user/dashboard', function () {
    $user = auth()->user();

    return Inertia::render('User/Dashboard', [
        'auth' => [
            'user' => $user
        ]
    ]);
})->middleware(['auth', 'verified', 'can:isUser'])->name('user.dashboard');

// Route Chiffrage - Nouveau devis
Route::middleware(['auth', 'verified', 'can:isUser'])
    ->prefix('chiffrage')
    ->name('chiffrage.')
    ->group(function () {
        Route::get('/nouveau', [ChiffrageController::class, 'nouveau'])->name('nouveau');
    });

// Profil (Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Auth routes de Breeze
require __DIR__.'/auth.php';
