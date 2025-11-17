<?php
// app/Http/Controllers/SauvegardeController.php
namespace App\Http\Controllers;

use App\Models\Sauvegarde;
use App\Models\Matrice;
use App\Models\Ville;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SauvegardeController extends Controller
{
    public function index()
    {
        $sauvegardes = Sauvegarde::where('user_id', auth()->id())
            ->with(['matrice'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('User/Sauvegardes/Index', [
            'sauvegardes' => $sauvegardes,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'matrice_id' => 'required|exists:matrices,id',
            'data' => 'required|array',
            'current_step' => 'required|integer',
            'nom_sauvegarde' => 'nullable|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            $sauvegarde = Sauvegarde::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'matrice_id' => $request->matrice_id,
                ],
                [
                    'data' => $request->data,
                    'current_step' => $request->current_step,
                    'nom_sauvegarde' => $request->nom_sauvegarde ?? 'Brouillon ' . now()->format('d/m/Y H:i'),
                    'statut' => 'brouillon'
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Sauvegarde effectuée avec succès',
                'sauvegarde' => $sauvegarde
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de la sauvegarde: ' . $e->getMessage()], 500);
        }
    }

    public function show(Sauvegarde $sauvegarde)
    {
        // Vérifier que l'utilisateur peut accéder à cette sauvegarde
        if ($sauvegarde->user_id !== auth()->id()) {
            abort(403, 'Non autorisé');
        }

        $villes = Ville::all();

        return Inertia::render('User/Chiffrage/Nouveau', [
            'auth' => ['user' => auth()->user()],
            'matrice_id' => $sauvegarde->matrice_id,
            'sauvegarde_id' => $sauvegarde->id, // 🔥 FIX: Indiquer qu'on vient d'une sauvegarde
            'matrice' => $sauvegarde->matrice,
            'sauvegarde' => $sauvegarde,
            'villes' => $villes
        ]);
    }
    public function getByMatrice($matrice_id)
{
    $sauvegarde = Sauvegarde::where('user_id', auth()->id())
        ->where('matrice_id', $matrice_id)
        ->first();

    return response()->json($sauvegarde);
}

    public function update(Request $request, Sauvegarde $sauvegarde)
    {
        // Vérifier que l'utilisateur peut modifier cette sauvegarde
        if ($sauvegarde->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $request->validate([
            'data' => 'required|array',
            'current_step' => 'required|integer',
            'nom_sauvegarde' => 'nullable|string|max:255'
        ]);

        $sauvegarde->update([
            'data' => $request->data,
            'current_step' => $request->current_step,
            'nom_sauvegarde' => $request->nom_sauvegarde ?? $sauvegarde->nom_sauvegarde,
        ]);

        return response()->json([
            'message' => 'Sauvegarde mise à jour avec succès',
            'sauvegarde' => $sauvegarde
        ]);
    }

    public function destroy(Sauvegarde $sauvegarde)
    {
        // Vérifier que l'utilisateur peut supprimer cette sauvegarde
        if ($sauvegarde->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Non autorisé']);
        }

        $sauvegarde->delete();

        return redirect()->route('sauvegardes.index')
            ->with('success', 'Sauvegarde supprimée avec succès');
    }

    public function getCount()
    {
        $count = Sauvegarde::where('user_id', auth()->id())->count();

        return response()->json(['count' => $count]);
    }
}
