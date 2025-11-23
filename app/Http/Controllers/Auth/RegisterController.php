<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationCode;
use App\Mail\VerificationCodeMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Carbon\Carbon;

class RegisterController extends Controller
{
    /**
     * Afficher le formulaire d'inscription
     */
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Traiter l'inscription
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom_complet' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Créer l'utilisateur avec le rôle "client"
        $user = User::create([
            'nom_complet' => $request->nom_complet,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Le rôle par défaut est "user" (client)
            'email_verified_at' => null, // Non vérifié
        ]);

        // Générer le code de vérification
        $code = VerificationCode::generateCode();

        VerificationCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(30), // Expire dans 30 minutes
            'is_used' => false,
        ]);

        // Envoyer l'e-mail avec le code
        try {
            Mail::to($user->email)->send(new VerificationCodeMail($user, $code));
        } catch (\Exception $e) {
            // Log l'erreur mais continue le processus
            \Log::error('Erreur envoi email: ' . $e->getMessage());
        }

        event(new Registered($user));

        // Rediriger vers la page de vérification
        return redirect()->route('verification.notice')->with([
            'email' => $user->email,
            'message' => 'Un code de vérification a été envoyé à votre adresse e-mail.'
        ]);
    }

    /**
     * Afficher la page de vérification
     */
    public function showVerificationForm()
    {
        // Si l'utilisateur est déjà connecté et vérifié, rediriger
        if (auth()->check() && auth()->user()->email_verified_at) {
            return redirect()->route('user.dashboard');
        }

        // Si pas d'email en session, rediriger vers login
        if (!session('email')) {
            return redirect()->route('login')->with('error', 'Session expirée. Veuillez vous reconnecter.');
        }

        return Inertia::render('Auth/VerifyEmail', [
            'email' => session('email'),
            'message' => session('message'),
        ]);
    }

    /**
     * Vérifier le code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'errors' => ['email' => 'Utilisateur non trouvé.']
            ], 422);
        }

        // Vérifier le code
        $verificationCode = VerificationCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->first();

        if (!$verificationCode) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => '❌ Code de vérification invalide. Veuillez vérifier le code reçu par email.']
            ], 422);
        }

        if ($verificationCode->isExpired()) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => '⏰ Ce code a expiré. Veuillez demander un nouveau code.']
            ], 422);
        }

        // Marquer le code comme utilisé
        $verificationCode->update(['is_used' => true]);

        // Marquer l'utilisateur comme vérifié
        $user->update(['email_verified_at' => now()]);

        // 🔥 Envoyer un email de notification à l'administrateur
        try {
            $adminEmail = config('mail.from.address'); // Email configuré dans .env (omarelkhali@gmail.com)
            Mail::to($adminEmail)->send(new \App\Mail\NewUserRegisteredMail($user));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email admin: ' . $e->getMessage());
        }

        // Renvoyer succès
        return response()->json([
            'success' => true,
            'message' => 'Votre compte a été vérifié avec succès!',
            'redirect' => route('login')
        ], 200);
    }

    /**
     * Renvoyer un nouveau code
     */
    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'Utilisateur non trouvé.']);
        }

        if ($user->email_verified_at) {
            return back()->withErrors(['email' => 'Ce compte est déjà vérifié.']);
        }

        // Invalider les anciens codes
        VerificationCode::where('user_id', $user->id)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // Générer un nouveau code
        $code = VerificationCode::generateCode();

        VerificationCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(30),
            'is_used' => false,
        ]);

        // Envoyer l'e-mail
        try {
            Mail::to($user->email)->send(new VerificationCodeMail($user, $code));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email: ' . $e->getMessage());
        }

        return back()->with('success', 'Un nouveau code a été envoyé à votre adresse e-mail.');
    }
}
