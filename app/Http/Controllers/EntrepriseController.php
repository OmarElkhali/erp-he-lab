<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Entreprise;

class EntrepriseController extends Controller
{
    // Recherche d'une entreprise par ICE
    public function findByIce($ice)
    {
        $entreprise = Entreprise::where('ice', $ice)->first();

        if (!$entreprise) {
            return response()->json(['message' => 'Entreprise non trouvée'], 404);
        }

        return response()->json($entreprise);
    }
}
