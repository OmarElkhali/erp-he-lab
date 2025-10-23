<?php
// app/Http/Controllers/VilleController.php
namespace App\Http\Controllers;

use App\Models\Ville;
use Illuminate\Http\Request;

class VilleController extends Controller
{
    public function index()
    {
        try {
            $villes = Ville::orderBy('nom')->get(['id', 'nom', 'frais_deplacement']);
            return response()->json($villes);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }
}