<?php
// app/Http/Controllers/DemandeController.php
namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Entreprise;
use App\Models\Site;
use App\Models\Poste;
use App\Models\User;
use App\Models\Notification;
use App\Models\Matrice;
use App\Models\Composant;
use App\Models\Ville;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DemandeController extends Controller
{
    public function create(Request $request)
    {
        $matriceId = $request->query('matrice_id');
        $matrice = null;
        
        if ($matriceId) {
            $matrice = Matrice::find($matriceId);
        }
        
        return Inertia::render('User/Chiffrage/Nouveau', [
            'auth' => ['user' => auth()->user()],
            'matrice_id' => $matriceId,
            'matrice' => $matrice
        ]);
    }


public function store(Request $request)
{
    DB::beginTransaction();
    
    try {
        // 1. Créer ou trouver l'entreprise
        $entreprise = Entreprise::firstOrCreate(
            ['ice' => $request->ice],
            [
                'nom' => $request->nom,
                'adresse' => $request->adresse,
                'contact_nom' => $request->contact_nom,
                'contact_prenom' => $request->contact_prenom,
                'contact_fonction' => $request->contact_fonction,
                'telephone' => $request->telephone,
                'email' => $request->email,
            ]
        );

        // 2. Créer les sites AVEC ville_id
        $siteIds = [];
        foreach ($request->sites as $siteData) {
            $site = Site::create([
                'entreprise_id' => $entreprise->id,
                'nom_site' => $siteData['nom_site'],
                'ville_id' => $siteData['ville_id'],
                'code_site' => $siteData['code_site'] ?? null,
            ]);
            $siteIds[] = $site->id;
        }

        // 3. Créer la demande AVEC user_id
        $demande = Demande::create([
            'user_id' => auth()->id(),
            'entreprise_id' => $entreprise->id,
            'matrice_id' => $request->matrice_id,
            'site_id' => $siteIds[0],
            'date_creation' => now(),
            'statut' => 'en_attente',
            'contact_nom_demande' => $request->contact_nom_demande ?? $request->contact_nom,
            'contact_email_demande' => $request->contact_email_demande ?? $request->email,
            'contact_tel_demande' => $request->contact_tel_demande ?? $request->telephone,
        ]);

        // 4. Créer les postes avec leurs composants
        $postesCount = 0;
        foreach ($request->postes as $posteData) {
            $poste = Poste::create([
                'demande_id' => $demande->id,
                'site_id' => $siteIds[0],
                'nom_poste' => $posteData['nom_poste'],
                'zone_activite' => $posteData['zone_activite'],
                'description' => $posteData['description'],
                'personnes_exposees' => $posteData['personnes_exposees'],
                'duree_shift' => $posteData['duree_shift'],
                'duree_exposition_quotidienne' => $posteData['duree_exposition_quotidienne'],
                'nb_shifts' => $posteData['nb_shifts'],
                'produit' => $posteData['produit'] ?? '',
            ]);
            $postesCount++;

            // Attacher les composants
            if (!empty($posteData['composants'])) {
                $poste->composants()->attach($posteData['composants']);
            }
        }

        // 5. ENVOYER LA NOTIFICATION À TOUS LES ADMINS
        $admins = User::where('role', 'admin')->get();
        $matrice = Matrice::find($request->matrice_id);
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'nouvelle_demande',
                'data' => [
                    'demande_id' => $demande->id,
                    'code_affaire' => $demande->code_affaire,
                    'entreprise' => $entreprise->nom,
                    'ice' => $entreprise->ice,
                    'matrice' => $matrice->label,
                    'site' => $site->nom_site,
                    'ville' => $site->ville->nom ?? 'Non spécifiée',
                    'postes_count' => $postesCount,
                    'contact_nom' => $demande->contact_nom_demande,
                    'contact_email' => $demande->contact_email_demande,
                    'contact_tel' => $demande->contact_tel_demande,
                    'date_creation' => $demande->date_creation,
                    'user_id' => auth()->id(),
                ],
                'is_read' => false,
                'is_accepted' => null
            ]);
        }

        DB::commit();

        return redirect()->route('user.dashboard')
            ->with('success', 'Demande créée avec succès! Code affaire: ' . $demande->code_affaire);

    } catch (\Exception $e) {
        DB::rollBack();
        
        return back()->withErrors([
            'error' => 'Erreur lors de la création de la demande: ' . $e->getMessage()
        ]);
    }
}

public function historiqueMatrice($matrice_id)
{
    $matrice = Matrice::findOrFail($matrice_id);
    
    $demandes = Demande::with([
        'entreprise',
        'site', 
        'postes.composants.famille'
    ])
    ->where('matrice_id', $matrice_id)
    ->orderBy('created_at', 'desc')
    ->get();

    // Calculer le coût total pour chaque demande
    $chiffrageController = new ChiffrageController();
    
    $demandes->each(function ($demande) use ($chiffrageController) {
        $resultatCout = $chiffrageController->calculerCoutTotal($demande);
        $demande->cout_total_avec_deplacement = $resultatCout['total_avec_deplacement'];
        $demande->cout_total_sans_deplacement = $resultatCout['total_sans_deplacement'];
        $demande->detail_cout = $resultatCout['detail'];
        
        // 🔹 CORRECTION : S'assurer que ville est une chaîne
        if (is_object($demande->site->ville)) {
            $demande->site->ville = $demande->site->ville->nom ?? 'Ville inconnue';
        }
    });

    return Inertia::render('User/Chiffrage/Historique', [
        'demandes' => $demandes,
        'matrice' => $matrice
    ]);
}
public function edit(Demande $demande)
{
    // Vérifier que l'utilisateur peut modifier cette demande
    if (!in_array($demande->statut, ['en_attente', 'refusee'])) {
        abort(403, 'Cette demande ne peut pas être modifiée');
    }

    $demande->load([
        'entreprise',
        'site.ville', // Charger la ville du site
        'postes.composants'
    ]);

    $matrices = Matrice::all();
    $villes = Ville::all(); // Charger toutes les villes

    return Inertia::render('User/Chiffrage/Edit', [
        'demande' => $demande,
        'matrices' => $matrices,
        'villes' => $villes, // Passer les villes au frontend
        'auth' => ['user' => auth()->user()]
    ]);
}


public function update(Request $request, Demande $demande)
{
    // Vérifier que la demande peut être modifiée
    if (!in_array($demande->statut, ['en_attente', 'refusee'])) {
        return back()->withErrors([
            'error' => 'Cette demande ne peut pas être modifiée'
        ]);
    }

    DB::beginTransaction();
    
    try {
        // 1. Mettre à jour l'entreprise
        $entreprise = Entreprise::updateOrCreate(
            ['ice' => $request->ice],
            [
                'nom' => $request->nom,
                'adresse' => $request->adresse,
                'contact_nom' => $request->contact_nom,
                'contact_prenom' => $request->contact_prenom,
                'contact_fonction' => $request->contact_fonction,
                'telephone' => $request->telephone,
                'email' => $request->email,
            ]
        );

        // 2. Mettre à jour les sites AVEC ville_id
        $siteIds = [];
        foreach ($request->sites as $siteData) {
            $site = Site::updateOrCreate(
                [
                    'entreprise_id' => $entreprise->id,
                    'nom_site' => $siteData['nom_site']
                ],
                [
                    'ville_id' => $siteData['ville_id'], // Utiliser ville_id
                    'code_site' => $siteData['code_site'] ?? null,
                ]
            );
            $siteIds[] = $site->id;
        }

        // 3. Mettre à jour la demande
        $demande->update([
            'entreprise_id' => $entreprise->id,
            'matrice_id' => $request->matrice_id,
            'site_id' => $siteIds[0],
            'contact_nom_demande' => $request->contact_nom_demande ?? $request->contact_nom,
            'contact_email_demande' => $request->contact_email_demande ?? $request->email,
            'contact_tel_demande' => $request->contact_tel_demande ?? $request->telephone,
        ]);

        // 4. Supprimer les anciens postes et recréer
        $demande->postes()->delete();

        foreach ($request->postes as $posteData) {
            $poste = Poste::create([
                'demande_id' => $demande->id,
                'site_id' => $siteIds[0],
                'nom_poste' => $posteData['nom_poste'],
                'zone_activite' => $posteData['zone_activite'],
                'description' => $posteData['description'],
                'personnes_exposees' => $posteData['personnes_exposees'],
                'duree_shift' => $posteData['duree_shift'],
                'duree_exposition_quotidienne' => $posteData['duree_exposition_quotidienne'],
                'nb_shifts' => $posteData['nb_shifts'],
                'produit' => $posteData['produit'] ?? '', // Ajouter le produit
            ]);

            // Attacher les composants
            if (!empty($posteData['composants'])) {
                $poste->composants()->attach($posteData['composants']);
            }
        }

        DB::commit();

        return redirect()->route('historique.matrice', ['matrice_id' => $demande->matrice_id])
            ->with('success', 'Demande modifiée avec succès!');

    } catch (\Exception $e) {
        DB::rollBack();
        
        return back()->withErrors([
            'error' => 'Erreur lors de la modification de la demande: ' . $e->getMessage()
        ]);
    }
}


public function destroy(Demande $demande)
{
    DB::beginTransaction();
    
    try {
        // Vérifier que l'utilisateur peut supprimer cette demande
        if ($demande->user_id !== auth()->id()) {
            return back()->withErrors([
                'error' => 'Vous n\'êtes pas autorisé à supprimer cette demande'
            ]);
        }

        // Vérifier que la demande peut être supprimée (seulement si en attente)
        if ($demande->statut !== 'en_attente') {
            return back()->withErrors([
                'error' => 'Seules les demandes en attente peuvent être supprimées'
            ]);
        }

        // 1. Supprimer les notifications associées à cette demande pour les admins
        Notification::where('type', 'nouvelle_demande')
            ->where('data->demande_id', $demande->id)
            ->delete();

        // 2. Supprimer les composants associés aux postes (table pivot)
        foreach ($demande->postes as $poste) {
            $poste->composants()->detach();
        }

        // 3. Supprimer les postes
        $demande->postes()->delete();

        // 4. Supprimer la demande
        $demande->delete();

        DB::commit();

        return redirect()->back()->with('success', 'Demande supprimée avec succès');

    } catch (\Exception $e) {
        DB::rollBack();
        
        return back()->withErrors([
            'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
        ]);
    }
}
    public function show(Demande $demande)
    {
        $demande->load([
            'entreprise',
            'matrice', 
            'site.ville', 
            'site',
            'postes.composants'
        ]);

        return Inertia::render('User/Chiffrage/Show', [
            'demande' => $demande,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function telechargerDemande(Demande $demande)
    {
        // Logique pour générer et télécharger le PDF
        // Vous pouvez utiliser Dompdf, TCPDF, etc.
        
        return response()->json(['message' => 'Fonction de téléchargement à implémenter']);
    }
}