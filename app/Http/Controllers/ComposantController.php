<?php

namespace App\Http\Controllers;

use App\Models\Composant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComposantController extends Controller
{
    // Méthode pour retourner tous les composants triés
    public function index(Request $request)
    {
        $query = Composant::query();

        // Si recherche par nom
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nom', 'like', "%{$search}%");
        }

        $composants = $query->orderBy('nom', 'asc')->get();

        return response()->json($composants);
    }

    // Exemple si tu passes via Inertia pour un formulaire
    public function create()
    {
        $composants = Composant::orderBy('nom')->get();
        return Inertia::render('Formulaire/PosteTravail', [
            'composantsDisponibles' => $composants,
        ]);
    }
}
