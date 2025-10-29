<?php
// app/Http/Controllers/ChiffrageController.php
namespace App\Http\Controllers;

use App\Models\Cout;
use App\Models\Demande;
use Illuminate\Http\Request;

class ChiffrageController extends Controller
{
    public function calculerCoutTotal(Demande $demande)
    {
        // Récupération des coûts FIXES depuis la BDD
        $C1 = Cout::where('code', 'C1')->value('valeur') ?? 700; // Prélèvement (Fixe)
        $C4 = Cout::where('code', 'C4')->value('valeur') ?? 200; // Rapport (Fixe)
        $C5 = Cout::where('code', 'C5')->value('valeur') ?? 300; // Logistique (Fixe)
        
        // 🔹 CORRECTION : Récupérer les frais de déplacement UNE SEULE FOIS PAR VILLE
        $C6_total = 0;
        $villesDejaCalculees = []; // Pour éviter les doublons
        
        if ($demande->sites && $demande->sites->count() > 0) {
            foreach ($demande->sites as $site) {
                if ($site->ville && $site->ville->frais_deplacement) {
                    $villeId = $site->ville->id;
                    
                    // Vérifier si on a déjà calculé les frais pour cette ville
                    if (!in_array($villeId, $villesDejaCalculees)) {
                        $C6_total += $site->ville->frais_deplacement;
                        $villesDejaCalculees[] = $villeId; // Marquer comme calculée
                    }
                }
            }
        }

        $totalPostes = 0;
        $detailPostes = [];
        
        // 🔹 CORRECTION : Charger les postes depuis TOUS les sites
        $tousLesPostes = collect();
        foreach ($demande->sites as $site) {
            if ($site->postes) {
                $tousLesPostes = $tousLesPostes->merge($site->postes);
            }
        }

        // Regrouper toutes les familles UNIQUES de tous les postes
        $famillesUniques = collect();
        $composantsParFamille = collect();

        // Première passe : collecter toutes les familles uniques
        foreach ($tousLesPostes as $poste) {
            foreach ($poste->composants->groupBy('famille_id') as $familleId => $composantsFamille) {
                $famille = $composantsFamille->first()->famille;
                
                // Ajouter la famille à la collection si elle n'existe pas déjà
                if (!$famillesUniques->has($familleId)) {
                    $famillesUniques->put($familleId, $famille);
                }
                
                // Ajouter les composants à la famille
                if (!$composantsParFamille->has($familleId)) {
                    $composantsParFamille->put($familleId, collect());
                }
                $composantsParFamille[$familleId] = $composantsParFamille[$familleId]->merge($composantsFamille);
            }
        }

        // CALCUL DES COÛTS PAR FAMILLE (UNIQUES)
        $coutParFamille = [];
        $C1_total = 0;
        $C2_total = 0;
        $C3_total = 0;

        foreach ($famillesUniques as $familleId => $famille) {
            $composantsFamille = $composantsParFamille[$familleId];
            
            // C1: Prélèvement - 700 MAD UNIQUEMENT pour chaque famille (même si dans plusieurs postes)
            $C1_famille = $C1;
            
            // C2: Préparation - Coût fixe UNIQUE par famille
            $C2_famille = $famille->cout_preparation ?? 200;
            
            // C3: Analyse - Somme des coûts d'analyse de TOUS les composants de cette famille
            $C3_famille = $composantsFamille->sum('cout_analyse');
            
            $coutFamille = $C1_famille + $C2_famille + $C3_famille;
            
            $coutParFamille[$familleId] = [
                'famille' => $famille,
                'C1' => $C1_famille,
                'C2' => $C2_famille,
                'C3' => $C3_famille,
                'total_famille' => $coutFamille,
                'composants' => $composantsFamille->map(function($composant) {
                    return [
                        'nom' => $composant->nom,
                        'cas_number' => $composant->cas_number,
                        'cout_analyse' => $composant->cout_analyse
                    ];
                })->unique('nom')->values()
            ];
            
            $C1_total += $C1_famille;
            $C2_total += $C2_famille;
            $C3_total += $C3_famille;
        }

        // DEUXIÈME PASSE : Répartir les coûts par poste pour l'affichage
        foreach ($tousLesPostes as $posteIndex => $poste) {
            $coutPoste = 0;
            $detailFamilles = [];

            foreach ($poste->composants->groupBy('famille_id') as $familleId => $composantsFamillePoste) {
                if (isset($coutParFamille[$familleId])) {
                    $familleData = $coutParFamille[$familleId];
                    
                    // Pour l'affichage par poste, on répartit proportionnellement
                    $totalComposantsFamille = $composantsParFamille[$familleId]->count();
                    $composantsDansPoste = $composantsFamillePoste->count();
                    $ratio = $totalComposantsFamille > 0 ? $composantsDansPoste / $totalComposantsFamille : 1;
                    
                    $C3_poste = $composantsFamillePoste->sum('cout_analyse');
                    
                    $coutFamillePoste = $C3_poste; // Seul C3 est réparti par poste
                    $coutPoste += $coutFamillePoste;

                    $detailFamilles[] = [
                        'famille' => $familleData['famille']->libelle,
                        'C1' => $familleData['C1'] * ($ratio > 0 ? 1 : 0),
                        'C2' => $familleData['C2'] * ($ratio > 0 ? 1 : 0),
                        'C3' => $C3_poste,
                        'total_famille' => $coutFamillePoste,
                        'composants' => $composantsFamillePoste->map(function($composant) {
                            return [
                                'nom' => $composant->nom,
                                'cas_number' => $composant->cas_number,
                                'cout_analyse' => $composant->cout_analyse
                            ];
                        }),
                        'ratio' => $ratio
                    ];
                }
            }
            
            $totalPostes += $coutPoste;
            $detailPostes[] = [
                'poste' => $poste->nom_poste,
                'site' => $poste->site->nom_site ?? 'Site inconnu',
                'ville' => $poste->site->ville->nom ?? 'Ville inconnue',
                'produit' => $poste->produit, 
                'total_poste' => $coutPoste,
                'familles' => $detailFamilles
            ];
        }

        // AJOUTER les coûts C1 et C2 UNIQUES au total des postes
        $totalPostes += $C1_total + $C2_total;

        // 🔹 CORRECTION : Calcul avec et sans déplacement
        $prixTotalAvecDeplacement = $C4 + $C5 + $totalPostes + $C6_total;
        $prixTotalSansDeplacement = $C4 + $C5 + $totalPostes; // Sans C6_total
        
        // 🔹 CORRECTION : Détail des frais de déplacement par VILLE UNIQUE
        $villesUniquesAvecFrais = [];
        if ($demande->sites) {
            $villesTraitees = [];
            foreach ($demande->sites as $site) {
                if ($site->ville && $site->ville->frais_deplacement) {
                    $villeId = $site->ville->id;
                    if (!in_array($villeId, $villesTraitees)) {
                        $villesUniquesAvecFrais[] = [
                            'nom_site' => $site->nom_site,
                            'ville' => $site->ville->nom ?? 'Ville inconnue',
                            'frais_deplacement' => $site->ville->frais_deplacement ?? 0
                        ];
                        $villesTraitees[] = $villeId;
                    }
                }
            }
        }
        
        return  [
            'total' => $prixTotalAvecDeplacement,
            'total_avec_deplacement' => $prixTotalAvecDeplacement,
            'total_sans_deplacement' => $prixTotalSansDeplacement,
            'detail' => [
                'C1_total' => $C1_total,
                'C2_total' => $C2_total,
                'C3_total' => $C3_total,
                'C4' => $C4,
                'C5' => $C5,
                'C6_total' => $C6_total,
                'C6_villes_uniques' => $villesUniquesAvecFrais, // Villes uniques avec frais
                'C6_sites' => $demande->sites ? $demande->sites->map(function($site) {
                    return [
                        'nom_site' => $site->nom_site,
                        'ville' => $site->ville->nom ?? 'Ville inconnue',
                        'frais_deplacement' => $site->ville->frais_deplacement ?? 0,
                        'ville_id' => $site->ville->id ?? null
                    ];
                }) : [],
                'total_postes' => $totalPostes,
                'detail_postes' => $detailPostes,
                'familles_uniques' => $famillesUniques->count(),
                'sites_count' => $demande->sites ? $demande->sites->count() : 0,
                'villes_uniques_count' => count($villesUniquesAvecFrais),
                'postes_count' => $tousLesPostes->count()
            ],
            'regles_appliquees' => [
                'C1' => '700 MAD par famille unique (même si présente dans plusieurs postes)',
                'C2' => 'Coût fixe par famille unique',
                'C3' => 'Somme des coûts d\'analyse de tous les composants',
                'C4' => '200 MAD fixe par demande',
                'C5' => '300 MAD fixe par demande',
                'C6' => 'Frais de déplacement UNIQUES par ville (même si plusieurs sites dans la même ville)'
            ]
        ];
    }

    // 🔹 CORRECTION : Méthode pour calculer uniquement sans déplacement
    public function calculerCoutSansDeplacement(Demande $demande)
    {
        $resultat = $this->calculerCoutTotal($demande);
        return $resultat['total_sans_deplacement'];
    }

    public function getCoutDemande($demandeId)
    {
        // 🔹 CORRECTION : Charger les relations correctes
        $demande = Demande::with([
            'sites.ville', 
            'sites.postes.composants.famille'
        ])->findOrFail($demandeId);
        
        return response()->json($this->calculerCoutTotal($demande));
    }

    // 🔹 CORRECTION : Récupérer uniquement le coût sans déplacement
    public function getCoutSansDeplacement($demandeId)
    {
        $demande = Demande::with([
            'sites.ville', 
            'sites.postes.composants.famille'
        ])->findOrFail($demandeId);
        
        $coutSansDeplacement = $this->calculerCoutSansDeplacement($demande);
        
        return response()->json([
            'total_sans_deplacement' => $coutSansDeplacement
        ]);
    }
}