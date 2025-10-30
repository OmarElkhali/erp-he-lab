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
        $C1 = Cout::where('code', 'C1')->value('valeur') ?? 700; // Prélèvement (Fixe) - PAR FAMILLE DANS CHAQUE PRODUIT
        $C4 = Cout::where('code', 'C4')->value('valeur') ?? 200; // Rapport (Fixe) - PAR DEMANDE
        $C5 = Cout::where('code', 'C5')->value('valeur') ?? 300; // Logistique (Fixe) - PAR DEMANDE
        
        // 🔹 CORRECTION : Frais de déplacement UNIQUES par ville
        $C6_total = 0;
        $villesDejaCalculees = [];
        
        if ($demande->sites && $demande->sites->count() > 0) {
            foreach ($demande->sites as $site) {
                if ($site->ville && $site->ville->frais_deplacement) {
                    $villeId = $site->ville->id;
                    
                    // Ne compter qu'une seule fois par ville
                    if (!in_array($villeId, $villesDejaCalculees)) {
                        $C6_total += $site->ville->frais_deplacement;
                        $villesDejaCalculees[] = $villeId;
                    }
                }
            }
        }

        // 🔹 NOUVELLE LOGIQUE : COMPTER CHAQUE FAMILLE DANS CHAQUE PRODUIT DE CHAQUE POSTE
        $totalPostes = 0;
        $detailPostes = [];
        $C1_total = 0;
        $C2_total = 0;
        $C3_total = 0;
        
        // Parcourir tous les postes de tous les sites
        foreach ($demande->sites as $site) {
            foreach ($site->postes as $poste) {
                $coutPoste = 0;
                $detailProduitsPoste = [];
                
                // Parcourir tous les produits de ce poste
                foreach ($poste->produits as $produit) {
                    $coutProduit = 0;
                    $detailFamillesProduit = [];
                    
                    // Grouper les composants par famille pour CE PRODUIT
                    if ($produit->composants && $produit->composants->count() > 0) {
                        foreach ($produit->composants->groupBy('famille_id') as $familleId => $composantsFamille) {
                            $famille = $composantsFamille->first()->famille;
                            
                            // C1: Prélèvement - 700 MAD POUR CHAQUE FAMILLE DANS CHAQUE PRODUIT
                            $C1_famille = $C1;
                            
                            // C2: Préparation - Coût fixe POUR CHAQUE FAMILLE DANS CHAQUE PRODUIT
                            $C2_famille = $famille->cout_preparation ?? 200;
                            
                            // C3: Analyse - Somme des coûts d'analyse des composants de CETTE FAMILLE DANS CE PRODUIT
                            $C3_famille = $composantsFamille->sum('cout_analyse');
                            
                            $coutFamille = $C1_famille + $C2_famille + $C3_famille;
                            $coutProduit += $coutFamille;
                            
                            // Ajouter aux totaux globaux
                            $C1_total += $C1_famille;
                            $C2_total += $C2_famille;
                            $C3_total += $C3_famille;
                            
                            $detailFamillesProduit[] = [
                                'famille' => $famille->libelle ?? 'Famille inconnue',
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
                                })
                            ];
                        }
                    }
                    
                    $coutPoste += $coutProduit;
                    
                    $detailProduitsPoste[] = [
                        'produit' => $produit->nom,
                        'description' => $produit->description,
                        'total_produit' => $coutProduit,
                        'familles' => $detailFamillesProduit,
                        'nombre_familles' => count($detailFamillesProduit),
                        'nombre_composants' => $produit->composants ? $produit->composants->count() : 0
                    ];
                }
                
                $totalPostes += $coutPoste;
                
                $detailPostes[] = [
                    'poste' => $poste->nom_poste,
                    'site' => $site->nom_site,
                    'ville' => $site->ville->nom ?? 'Ville inconnue',
                    'total_poste' => $coutPoste,
                    'produits' => $detailProduitsPoste,
                    'nombre_produits' => count($detailProduitsPoste),
                    'nombre_familles' => array_sum(array_column($detailProduitsPoste, 'nombre_familles'))
                ];
            }
        }

        // 🔹 CALCUL DES TOTAUX FINAUX
        $totalAnalyse = $C1_total + $C2_total + $C3_total;
        $prixTotalAvecDeplacement = $C4 + $C5 + $totalAnalyse + $C6_total;
        $prixTotalSansDeplacement = $C4 + $C5 + $totalAnalyse;
        
        // Compter le nombre total de familles (chaque famille dans chaque produit)
        $nombreTotalFamilles = 0;
        $nombreTotalComposants = 0;
        $nombreTotalProduits = 0;
        
        foreach ($detailPostes as $poste) {
            $nombreTotalFamilles += $poste['nombre_familles'];
            $nombreTotalProduits += $poste['nombre_produits'];
            foreach ($poste['produits'] as $produit) {
                $nombreTotalComposants += $produit['nombre_composants'];
            }
        }
        
        // Détail des frais de déplacement par ville unique
        $villesUniquesAvecFrais = [];
        if ($demande->sites) {
            $villesTraitees = [];
            foreach ($demande->sites as $site) {
                if ($site->ville && $site->ville->frais_deplacement) {
                    $villeId = $site->ville->id;
                    if (!in_array($villeId, $villesTraitees)) {
                        $villesUniquesAvecFrais[] = [
                            'ville' => $site->ville->nom ?? 'Ville inconnue',
                            'frais_deplacement' => $site->ville->frais_deplacement ?? 0,
                            'sites' => $demande->sites->where('ville_id', $villeId)->pluck('nom_site')->toArray()
                        ];
                        $villesTraitees[] = $villeId;
                    }
                }
            }
        }
        
        return [
            'total' => $prixTotalAvecDeplacement,
            'total_avec_deplacement' => $prixTotalAvecDeplacement,
            'total_sans_deplacement' => $prixTotalSansDeplacement,
            'detail' => [
                // COÛTS FIXES PAR DEMANDE
                'C4_rapport' => $C4,
                'C5_logistique' => $C5,
                'C6_deplacement_total' => $C6_total,
                'C6_villes_uniques' => $villesUniquesAvecFrais,
                
                // COÛTS PAR FAMILLE (C1 + C2 + C3)
                'C1_prelevement_total' => $C1_total,
                'C2_preparation_total' => $C2_total,
                'C3_analyse_total' => $C3_total,
                
                // STATISTIQUES
                'nombre_total_familles' => $nombreTotalFamilles,
                'nombre_total_composants' => $nombreTotalComposants,
                'nombre_total_produits' => $nombreTotalProduits,
                'nombre_postes_total' => $demande->sites->sum(function($site) {
                    return $site->postes->count();
                }),
                'nombre_sites' => $demande->sites->count(),
                
                // TOTAL ANALYSE
                'total_analyse' => $totalAnalyse,
                
                // DÉTAIL PAR POSTE
                'detail_postes' => $detailPostes
            ],
            'regles_appliquees' => [
                'C1 (Prélèvement)' => $C1 . ' MAD par famille dans chaque produit (même famille répétée dans différents produits)',
                'C2 (Préparation)' => 'Coût de préparation par famille dans chaque produit',
                'C3 (Analyse)' => 'Somme des coûts d\'analyse des composants de chaque famille dans chaque produit',
                'C4 (Rapport)' => $C4 . ' MAD fixe par demande',
                'C5 (Logistique)' => $C5 . ' MAD fixe par demande',
                'C6 (Déplacement)' => 'Frais de déplacement UNIQUES par ville'
            ],
            'resume' => [
                'Coûts fixes (C4 + C5)' => $C4 + $C5,
                'Prélèvement (C1)' => $C1_total,
                'Préparation (C2)' => $C2_total,
                'Analyse (C3)' => $C3_total,
                'Déplacement (C6)' => $C6_total,
                'Total analyse' => $totalAnalyse,
                'TOTAL AVEC DÉPLACEMENT' => $prixTotalAvecDeplacement,
                'TOTAL SANS DÉPLACEMENT' => $prixTotalSansDeplacement
            ]
        ];
    }

    public function calculerCoutSansDeplacement(Demande $demande)
    {
        $resultat = $this->calculerCoutTotal($demande);
        return $resultat['total_sans_deplacement'];
    }

    public function getCoutDemande($demandeId)
    {
        $demande = Demande::with([
            'sites.ville', 
            'sites.postes.produits.composants.famille'
        ])->findOrFail($demandeId);
        
        return response()->json($this->calculerCoutTotal($demande));
    }

    public function getCoutSansDeplacement($demandeId)
    {
        $demande = Demande::with([
            'sites.ville', 
            'sites.postes.produits.composants.famille'
        ])->findOrFail($demandeId);
        
        $coutSansDeplacement = $this->calculerCoutSansDeplacement($demande);
        
        return response()->json([
            'total_sans_deplacement' => $coutSansDeplacement
        ]);
    }

    // 🔹 NOUVELLE MÉTHODE : Récupérer seulement le résumé
    public function getResumeCout($demandeId)
    {
        $demande = Demande::with([
            'sites.ville', 
            'sites.postes.produits.composants.famille'
        ])->findOrFail($demandeId);
        
        $resultat = $this->calculerCoutTotal($demande);
        
        return response()->json([
            'resume' => $resultat['resume'],
            'total_avec_deplacement' => $resultat['total_avec_deplacement'],
            'total_sans_deplacement' => $resultat['total_sans_deplacement']
        ]);
    }
}