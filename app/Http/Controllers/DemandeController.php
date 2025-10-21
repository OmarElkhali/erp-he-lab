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

            // 2. Créer les sites
            $siteIds = [];
            foreach ($request->sites as $siteData) {
                $site = Site::create([
                    'entreprise_id' => $entreprise->id,
                    'nom_site' => $siteData['nom_site'],
                    'ville' => $siteData['ville'],
                    'code_site' => $siteData['code_site'] ?? null,
                ]);
                $siteIds[] = $site->id;
            }

            // 3. Créer la demande
            $demande = Demande::create([
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
                        'ville' => $site->ville,
                        'postes_count' => $postesCount,
                        'contact_nom' => $demande->contact_nom_demande,
                        'contact_email' => $demande->contact_email_demande,
                        'contact_tel' => $demande->contact_tel_demande,
                        'date_creation' => $demande->date_creation,
                    ],
                    'is_read' => false,
                    'is_accepted' => false
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
                'postes.composants' // Charger les postes avec leurs composants
            ])
            ->where('matrice_id', $matrice_id)
            ->orderBy('created_at', 'desc')
            ->get();

            return Inertia::render('User/Chiffrage/Historique', [
                'demandes' => $demandes,
                'matrice' => $matrice
            ]);
        }
    public function accepterDemande(Demande $demande)
    {
        $demande->update(['statut' => 'acceptee']);
        
        // Ici vous pouvez ajouter la logique d'envoi d'email, notification, etc.
        
        return back()->with('success', 'Demande acceptée avec succès');
    }

    public function refuserDemande(Demande $demande)
    {
        $demande->update(['statut' => 'refusee']);
        
        return back()->with('success', 'Demande refusée');
    }
    public function show(Demande $demande)
    {
        $demande->load([
            'entreprise',
            'matrice', 
            'site',
            'postes.composants'
        ]);

        return Inertia::render('User/Chiffrage/Show', [
            'demande' => $demande
        ]);
    }

    public function telechargerDemande(Demande $demande)
    {
        // Logique pour générer et télécharger le PDF
        // Vous pouvez utiliser Dompdf, TCPDF, etc.
        
        return response()->json(['message' => 'Fonction de téléchargement à implémenter']);
    }
}