<?php
// routes/web.php

use App\Http\Controllers\ChiffrageController;
use App\Http\Controllers\EntrepriseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\ComposantController;
use App\Http\Controllers\NotificationController;
use App\Models\Matrice;
use App\Models\Ville;
use Illuminate\Support\Facades\Log; 
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

 Route::get('/', function () {
    return redirect()->route('login');
});

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// ========== ROUTES API ACCESSIBLES SANS AUTH (DOIT ÊTRE EN DEHORS DU GROUPE AUTH) ==========

// API Villes - ACCESSIBLE SANS AUTHENTIFICATION (TRÈS IMPORTANT)
Route::get('/api/villes', function () {
    try {
        Log::info('📥 Requête API villes reçue');
        $villes = Ville::orderBy('nom')->get(['id', 'nom', 'frais_deplacement']);
        Log::info('✅ Villes chargées: ' . $villes->count() . ' villes trouvées');
        return response()->json($villes);
    } catch (\Exception $e) {
        Log::error('❌ Erreur chargement villes: ' . $e->getMessage());
        return response()->json(['error' => 'Erreur serveur: ' . $e->getMessage()], 500);
    }
});

// Entreprises - ACCESSIBLE SANS AUTHENTIFICATION (pour l'autocomplete ICE)
Route::get('/entreprises/find/{ice}', [EntrepriseController::class, 'findByIce'])
    ->name('entreprises.find');

// API Composants - ACCESSIBLE SANS AUTHENTIFICATION
Route::get('/api/composants', [ComposantController::class, 'index']);

// API Matrices - ACCESSIBLE SANS AUTHENTIFICATION
Route::get('/api/matrices', function () {
    return Matrice::all(['id', 'label', 'value', 'abreviation']);
});

// ========== ROUTES PROTÉGÉES (nécessitent auth) ==========

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

// Dashboard Admin
Route::get('/admin/dashboard', function () {
    $user = auth()->user();
    return Inertia::render('Admin/Dashboard', [
        'auth' => ['user' => $user]
    ]);
})->middleware(['auth', 'verified', 'can:isAdmin'])->name('admin.dashboard');

// Dashboard User
Route::get('/user/dashboard', function () {
    $user = auth()->user();
    return Inertia::render('User/Dashboard', [
        'auth' => ['user' => $user]
    ]);
})->middleware(['auth', 'verified', 'can:isUser'])->name('user.dashboard');

// ✅ ROUTES UNIFIÉES
Route::middleware(['auth', 'verified'])->group(function () {
    // Routes utilisateur
    Route::middleware(['can:isUser'])->group(function () {
         // Demandes
        Route::get('/demandes/nouveau', [DemandeController::class, 'create'])->name('demandes.create'); 
        Route::post('/demandes', [DemandeController::class, 'store'])->name('demandes.store');
        Route::get('/historique/matrice/{matrice_id}', [DemandeController::class, 'historiqueMatrice'])->name('historique.matrice');
        Route::get('/demandes/{demande}', [DemandeController::class, 'show'])->name('demandes.show');
        Route::get('/demandes/{demande}/edit', [DemandeController::class, 'edit'])->name('demandes.edit');
        Route::put('/demandes/{demande}', [DemandeController::class, 'update'])->name('demandes.update');
        Route::delete('/demandes/{demande}', [DemandeController::class, 'destroy'])->name('demandes.destroy');
        Route::get('/api/demandes/{demande}/cout', [ChiffrageController::class, 'getCoutDemande']);
        
        // Chiffrage (redirections)
        Route::get('User/Chiffrage/Nouveau', function (Request $request) {
            $matrice_id = $request->query('matrice_id');
            return redirect()->route('demandes.create', ['matrice_id' => $matrice_id]);
        })->name('chiffrage.nouveau');
        
        Route::get('/chiffrage/historique', function (Request $request) {
            $matrice_id = $request->query('matrice_id');
            return redirect()->route('historique.matrice', ['matrice_id' => $matrice_id]);
        })->name('chiffrage.historique');
    });

    // Routes admin
    Route::middleware(['can:isAdmin'])->group(function () {
        Route::post('/admin/demandes/{demande}/accepter', [DemandeController::class, 'accepterDemande'])->name('admin.demandes.accepter');
        Route::post('/admin/demandes/{demande}/refuser', [DemandeController::class, 'refuserDemande'])->name('admin.demandes.refuser');
        Route::post('/admin/demandes/{demande}/telecharger', [DemandeController::class, 'telechargerDemande'])->name('admin.demandes.telecharger');
    });

    // ✅ ROUTES POUR LES NOTIFICATIONS - PROTÉGÉES
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::get('/admin/notifications', [NotificationController::class, 'adminIndex'])->name('admin.notifications');
    Route::get('/user/notifications', [NotificationController::class, 'userIndex'])->name('user.notifications');
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::get('/api/user-notifications', [NotificationController::class, 'getUserNotifications']);
    Route::get('/api/admin-notifications', [NotificationController::class, 'getAdminNotifications']);
});

// Profile routes - PROTÉGÉES
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';