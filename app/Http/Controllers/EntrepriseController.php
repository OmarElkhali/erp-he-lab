<?php
// app/Http/Controllers/EntrepriseController.php
namespace App\Http\Controllers;

use App\Models\Entreprise;
use Illuminate\Http\Request;

class EntrepriseController extends Controller
{
    public function findByIce($ice)
    {
        $entreprise = Entreprise::where('ice', $ice)->first();
        
        if (!$entreprise) {
            return response()->json(['error' => 'Entreprise non trouvée'], 404);
        }

        // Retourner toutes les données, y compris nom_prenom
        return response()->json([
            'ice' => $entreprise->ice,
            'nom' => $entreprise->nom,
            'adresse' => $entreprise->adresse,
            'nom_prenom' => $entreprise->nom_prenom, // AJOUTER ICI
            'contact_fonction' => $entreprise->contact_fonction,
            'telephone' => $entreprise->telephone,
            'email' => $entreprise->email,
        ]);
    }
}