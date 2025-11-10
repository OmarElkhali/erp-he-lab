<?php
// app/Http/Controllers/Auth/EmailVerificationController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'verification_code' => 'required|string|size:6',
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)
                    ->where('email_verification_code', $request->verification_code)
                    ->first();

        if (!$user) {
            return back()->withErrors([
                'verification_code' => 'Code de vérification invalide.'
            ]);
        }

        // Marquer l'email comme vérifié
        $user->update([
            'email_verified_at' => now(),
            'email_verification_code' => null
        ]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    public function show()
    {
        return inertia('Auth/VerifyEmail');
    }
}