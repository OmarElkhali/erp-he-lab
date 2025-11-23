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
use App\Models\Produit;
use App\Models\Ville;
use App\Models\Sauvegarde;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DemandeController extends Controller
{
     public function create(Request $request)
    {
        $matriceId = $request->query('matrice_id');
        $sauvegardeId = $request->query('sauvegarde_id'); // 🔥 FIX: Détecter si on vient d'une sauvegarde
        $matrice = null;

        if ($matriceId) {
            $matrice = Matrice::find($matriceId);
        }

        // Charger les villes pour le formulaire
        $villes = Ville::all();

        return Inertia::render('User/Chiffrage/Nouveau', [
            'auth' => ['user' => auth()->user()],
            'matrice_id' => $matriceId,
            'sauvegarde_id' => $sauvegardeId, // 🔥 FIX: Passer l'ID de sauvegarde
            'matrice' => $matrice,
            'villes' => $villes // Passer les villes au frontend
        ]);
    }


public function store(Request $request)
{
    // 🔥 FIX: Validation des données entrantes
    $validated = $request->validate([
        'ice' => 'required|string|max:255',
        'nom' => 'required|string|max:255',
        'adresse' => 'required|string|max:500',
        'nom_prenom' => 'required|string|max:255',
        'contact_fonction' => 'required|string|max:255',
        'telephone' => 'required|string|max:20',
        'email' => 'required|email|max:255',
        'matrice_id' => 'required|exists:matrices,id',
        'sites' => 'required|array|min:1',
        'sites.*.nom_site' => 'required|string|max:255',
        'sites.*.ville_id' => 'required|exists:villes,id',
        'sites.*.code_site' => 'nullable|string|max:50',
        'sites.*.postes' => 'required|array|min:1',
        'sites.*.postes.*.nom_poste' => 'required|string|max:255',
        'sites.*.postes.*.zone_activite' => 'required|string|max:255',
        'sites.*.postes.*.personnes_exposees' => 'nullable|integer|min:1',
        'sites.*.postes.*.duree_shift' => 'nullable|numeric|min:1',
        'sites.*.postes.*.duree_exposition_quotidienne' => 'nullable|numeric|min:0.25|max:24',
        'sites.*.postes.*.nb_shifts' => 'nullable|integer|min:1',
        'sites.*.postes.*.produits' => 'required|array|min:1',
        'sites.*.postes.*.produits.*.nom' => 'required|string|max:255',
        'sites.*.postes.*.produits.*.description' => 'required|string|max:1000',
        'sites.*.postes.*.produits.*.composants' => 'required|array|min:1',
        'sites.*.postes.*.produits.*.composants.*' => 'exists:composants,id',
    ]);

    DB::beginTransaction();

    try {
        // 1. Créer ou trouver l'entreprise
        $entreprise = Entreprise::firstOrCreate(
            ['ice' => $validated['ice']],
            [
                'nom' => $validated['nom'],
                'adresse' => $validated['adresse'],
                'nom_prenom' => $validated['nom_prenom'],
                'contact_fonction' => $validated['contact_fonction'],
                'telephone' => $validated['telephone'],
                'email' => $validated['email'],
            ]
        );

        // 2. Créer la demande
        $demande = Demande::create([
            'user_id' => auth()->id(),
            'entreprise_id' => $entreprise->id,
            'matrice_id' => $validated['matrice_id'],
            'date_creation' => now(),
            'statut' => 'en_attente',
            'contact_nom_demande' => $validated['nom_prenom'],
            'contact_email_demande' => $request->contact_email_demande ?? $validated['email'],
            'contact_tel_demande' => $request->contact_tel_demande ?? $validated['telephone'],
        ]);

        // 3. Créer les sites, postes et produits
        $totalPostesCount = 0;
        $totalProduitsCount = 0;

        foreach ($validated['sites'] as $siteData) {
            // 🔥 Créer le site
            $site = Site::create([
                'entreprise_id' => $entreprise->id,
                'demande_id' => $demande->id,
                'nom_site' => $siteData['nom_site'],
                'ville_id' => $siteData['ville_id'],
                'code_site' => $siteData['code_site'] ?? null,
            ]);

            // 🔥 Créer les postes pour CE SITE
            if (isset($siteData['postes']) && is_array($siteData['postes'])) {
                foreach ($siteData['postes'] as $posteData) {
                    $poste = Poste::create([
                        'demande_id' => $demande->id,
                        'site_id' => $site->id,
                        'nom_poste' => $posteData['nom_poste'],
                        'zone_activite' => $posteData['zone_activite'],
                        'personnes_exposees' => $posteData['personnes_exposees'] ?? null,
                        'duree_shift' => $posteData['duree_shift'] ?? null,
                        'duree_exposition_quotidienne' => $posteData['duree_exposition_quotidienne'] ?? null,
                        'nb_shifts' => $posteData['nb_shifts'] ?? null,
                    ]);
                    $totalPostesCount++;

                    // 🔥 Créer les PRODUITS pour CE POSTE
                    if (isset($posteData['produits']) && is_array($posteData['produits'])) {
                        foreach ($posteData['produits'] as $produitData) {
                            $produit = Produit::create([
                                'poste_id' => $poste->id,
                                'nom' => $produitData['nom'],
                                'description' => $produitData['description'] ?? null,
                            ]);
                            $totalProduitsCount++;

                            // 🔥 Attacher les COMPOSANTS au PRODUIT (table pivot)
                            if (!empty($produitData['composants']) && is_array($produitData['composants'])) {
                                $produit->composants()->attach($produitData['composants']);
                            }
                        }
                    }
                }
            }
        }

        // 4. 🔥 ENVOYER LA NOTIFICATION aux admins
        $admins = User::where('role', 'admin')->get();
        $matrice = Matrice::find($validated['matrice_id']);
        $premierSite = $demande->premierSite();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'nouvelle_demande',
                'data' => [
                    'demande_id' => $demande->id,
                    'code_affaire' => $demande->code_affaire,
                    'entreprise' => $entreprise->nom,
                    'ice' => $entreprise->ice,
                    'matrice' => $matrice->label ?? 'Non spécifiée',
                    'site' => $premierSite->nom_site ?? 'Non spécifié',
                    'ville' => $premierSite->ville->nom ?? 'Non spécifiée',
                    'postes_count' => $totalPostesCount,
                    'produits_count' => $totalProduitsCount,
                    'sites_count' => $demande->nombre_sites,
                    'contact_nom' => $demande->contact_nom_demande,
                    'contact_email' => $demande->contact_email_demande,
                    'contact_tel' => $demande->contact_tel_demande,
                    'date_creation' => $demande->date_creation->format('Y-m-d H:i:s'),
                    'user_id' => auth()->id(),
                ],
                'is_read' => false,
                'is_accepted' => null
            ]);
        }

        DB::commit();

        // 🔥 FIX: Supprimer la sauvegarde si elle existe
        if ($request->has('sauvegarde_id')) {
            $sauvegarde = Sauvegarde::find($request->sauvegarde_id);
            if ($sauvegarde && $sauvegarde->user_id === auth()->id()) {
                $sauvegarde->delete();
            }
        }

        // 🔥 FIX: Retourner JSON pour axios
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Demande créée avec succès!',
                'data' => [
                    'demande_id' => $demande->id,
                    'code_affaire' => $demande->code_affaire,
                    'redirect_url' => route('user.dashboard')
                ]
            ], 200);
        }

        return redirect()->route('user.dashboard')
            ->with('success', 'Demande créée avec succès! Code affaire: ' . $demande->code_affaire);

    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();

        // 🔥 FIX: Erreurs de validation en JSON
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }

        return back()->withErrors($e->errors())->withInput();

    } catch (\Exception $e) {
        DB::rollBack();

        // 🔥 Autres erreurs
        \Log::error('Erreur création demande: ' . $e->getMessage(), [
            'user_id' => auth()->id(),
            'trace' => $e->getTraceAsString()
        ]);

        // 🔥 FIX: Retourner JSON pour axios
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la demande',
                'error' => $e->getMessage()
            ], 500);
        }

        return back()->withErrors([
            'error' => 'Erreur lors de la création de la demande: ' . $e->getMessage()
        ])->withInput();
    }
}

public function historiqueMatrice($matrice_id)
{
    $matrice = Matrice::findOrFail($matrice_id);

    $demandes = Demande::with([
        'entreprise',
        'sites.ville', // Tous les sites avec leur ville
        'sites.postes.produits.composants.famille', // NOUVELLE RELATION : postes -> produits -> composants -> famille
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

        // Utiliser les accesseurs pour les comptes
        $demande->nombre_sites = $demande->sites->count();
        $demande->nombre_postes = $demande->sites->sum(function($site) {
            return $site->postes->count();
        });
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
        'sites.ville', // Tous les sites avec leur ville
        'sites.postes.produits.composants' // NOUVELLE RELATION
    ]);

    $matrices = Matrice::all();
    $villes = Ville::all();

    return Inertia::render('User/Chiffrage/Edit', [
        'demande' => $demande,
        'matrices' => $matrices,
        'villes' => $villes,
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
                'nom_prenom'=> $request->nom_prenom,
                'contact_fonction' => $request->contact_fonction,
                'telephone' => $request->telephone,
                'email' => $request->email,
            ]
        );

        // 2. 🔥 CORRECTION : Mettre à jour les contacts de la demande avec les nouvelles données de l'entreprise
        $demande->update([
            'entreprise_id' => $entreprise->id,
            'matrice_id' => $request->matrice_id,
            'contact_nom_demande' => $request->nom_prenom, // Utiliser le nom_prenom mis à jour
            'contact_email_demande' => $request->email,    // Utiliser l'email mis à jour
            'contact_tel_demande' => $request->telephone,  // Utiliser le téléphone mis à jour
        ]);

        // 3. Supprimer les anciennes données (sites, postes, produits)
        foreach ($demande->sites as $site) {
            foreach ($site->postes as $poste) {
                foreach ($poste->produits as $produit) {
                    $produit->composants()->detach();
                    $produit->delete();
                }
            }
            $site->postes()->delete();
        }
        $demande->sites()->delete();

        // 4. Recréer les sites avec leurs postes et produits
        foreach ($request->sites as $siteData) {
            $site = Site::create([
                'entreprise_id' => $entreprise->id,
                'demande_id' => $demande->id,
                'nom_site' => $siteData['nom_site'],
                'ville_id' => $siteData['ville_id'],
                'code_site' => $siteData['code_site'] ?? null,
            ]);

            if (isset($siteData['postes']) && is_array($siteData['postes'])) {
                foreach ($siteData['postes'] as $posteData) {
                    $poste = Poste::create([
                        'demande_id' => $demande->id,
                        'site_id' => $site->id,
                        'nom_poste' => $posteData['nom_poste'],
                        'zone_activite' => $posteData['zone_activite'],
                        'personnes_exposees' => $posteData['personnes_exposees'],
                        'duree_shift' => $posteData['duree_shift'],
                        'duree_exposition_quotidienne' => $posteData['duree_exposition_quotidienne'],
                        'nb_shifts' => $posteData['nb_shifts'],
                    ]);

                    // Créer les produits pour ce poste
                    if (isset($posteData['produits']) && is_array($posteData['produits'])) {
                        foreach ($posteData['produits'] as $produitData) {
                            $produit = Produit::create([
                                'poste_id' => $poste->id,
                                'nom' => $produitData['nom'],
                                'description' => $produitData['description'] ?? null,
                            ]);

                            // Attacher les composants au produit
                            if (!empty($produitData['composants'])) {
                                $produit->composants()->attach($produitData['composants']);
                            }
                        }
                    }
                }
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

        // 2. NOUVELLE LOGIQUE : Supprimer les composants associés aux PRODUITS (table pivot produit_composant)
        foreach ($demande->sites as $site) {
            foreach ($site->postes as $poste) {
                foreach ($poste->produits as $produit) {
                    // Détacher les composants du produit
                    $produit->composants()->detach();
                    // Supprimer le produit
                    $produit->delete();
                }
                // Supprimer le poste
                $poste->delete();
            }
            // Supprimer le site
            $site->delete();
        }

        // 3. Supprimer la demande
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
        'sites.ville',
        'sites.postes.produits.composants.famille' //
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
