<?php
// app/Http/Controllers/ChiffrageController.php
namespace App\Http\Controllers;

use App\Models\Cout;
use App\Models\Demande;
use App\Models\Poste;
use Illuminate\Http\Request;

class ChiffrageController extends Controller
{
    
public function calculerCoutTotal(Demande $demande)
{
    // Récupération des coûts FIXES depuis la BDD
    $C1 = Cout::where('code', 'C1')->value('valeur') ?? 700; // Prélèvement (Fixe) - PAR FAMILLE DANS CHAQUE POSTE
    $C4 = Cout::where('code', 'C4')->value('valeur') ?? 200; // Rapport (Fixe) - PAR SITE
    $C5 = Cout::where('code', 'C5')->value('valeur') ?? 300; // Logistique (Fixe) - PAR SITE
    
    // 🔹 NOUVELLE LOGIQUE : C4 et C5 PAR SITE, C6 PAR VILLE UNIQUE
    $C4_total = 0;
    $C5_total = 0;
    $C6_total = 0;
    $villesDejaCalculees = [];
    
    if ($demande->sites && $demande->sites->count() > 0) {
        foreach ($demande->sites as $site) {
            // C4: Rapport - 200 MAD PAR SITE
            $C4_total += $C4;
            
            // C5: Logistique - 300 MAD PAR SITE
            $C5_total += $C5;
            
            // C6: Déplacement - UNIQUE PAR VILLE
            if ($site->ville && $site->ville->frais_deplacement) {
                $villeId = $site->ville->id;
                if (!in_array($villeId, $villesDejaCalculees)) {
                    $C6_total += $site->ville->frais_deplacement;
                    $villesDejaCalculees[] = $villeId;
                }
            }
        }
    }

    // 🔹 LOGIQUE : CHAQUE POSTE EST CALCULÉ INDÉPENDAMMENT
    $totalAnalysePostes = 0;
    $detailPostes = [];
    $C1_total = 0;
    $C2_total = 0;
    $C3_total = 0;
    
    // Parcourir tous les postes de tous les sites
    foreach ($demande->sites as $site) {
        foreach ($site->postes as $poste) {
            $coutPoste = 0;
            $detailProduitsPoste = [];
            $famillesDansPoste = []; // Pour suivre les familles UNIQUES dans ce poste
            
            // Parcourir tous les produits de ce poste
            foreach ($poste->produits as $produit) {
                $coutProduit = 0;
                $detailFamillesProduit = [];
                
                // Grouper les composants par famille pour CE PRODUIT
                if ($produit->composants && $produit->composants->count() > 0) {
                    foreach ($produit->composants->groupBy('famille_id') as $familleId => $composantsFamille) {
                        $famille = $composantsFamille->first()->famille;
                        
                        // CORRECTION : Initialiser les coûts
                        $C1_famille = 0;
                        $C2_famille = 0;
                        $C3_famille = $composantsFamille->sum('cout_analyse');
                        
                        // C1 et C2 : UNIQUEMENT si la famille n'a pas encore été rencontrée dans ce poste
                        if (!in_array($familleId, $famillesDansPoste)) {
                            $C1_famille = $C1;
                            $C2_famille = $famille->cout_preparation ?? 200;
                            
                            // Ajouter aux totaux globaux
                            $C1_total += $C1_famille;
                            $C2_total += $C2_famille;
                            
                            // Marquer la famille comme déjà rencontrée
                            $famillesDansPoste[] = $familleId;
                        }
                        
                        // C3 : TOUJOURS ajouter (analyse de chaque composant)
                        $C3_total += $C3_famille;
                        
                        $coutFamille = $C1_famille + $C2_famille + $C3_famille;
                        $coutProduit += $coutFamille;
                        
                        $detailFamillesProduit[] = [
    'famille' => $famille->libelle ?? 'Famille inconnue',
    'famille_id' => $familleId,
    'code_famille' => $famille->code ?? null, // Code de la famille
    'code_preparation' => $famille->code_preparation ?? null, // Code préparation
    'cout_preparation' => $famille->cout_preparation ?? null, // Coût préparation
    'C1' => $C1_famille,
    'C2' => $C2_famille,
    'C3' => $C3_famille,
    'total_famille' => $coutFamille,
    'composants' => $composantsFamille->map(function($composant) {
        return [
            'nom' => $composant->nom,
            'cas_number' => $composant->cas_number,
            'code_analyse' => $composant->code_analyse ?? null, // Code analyse
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
            
            $totalAnalysePostes += $coutPoste;
            
            $detailPostes[] = [
                'poste' => $poste->nom_poste,
                'zone_activite' => $poste->zone_activite,
                'site' => $site->code_site,
                'ville' => $site->ville->nom ?? 'Ville inconnue',
                'total_poste' => $coutPoste,
                'produits' => $detailProduitsPoste,
                'nombre_produits' => count($detailProduitsPoste),
                'nombre_familles' => count($famillesDansPoste),
                'familles_uniques' => $famillesDansPoste
            ];
        }
    }

    // 🔹 CALCUL DES TOTAUX FINAUX
    $totalAnalyse = $C1_total + $C2_total + $C3_total;
    $prixTotalAvecDeplacement = $C4_total + $C5_total + $totalAnalyse + $C6_total;
    $prixTotalSansDeplacement = $C4_total + $C5_total + $totalAnalyse;
    
    // Compter les statistiques globales
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
    
    // 🔹 CORRECTION : Détail des frais par site
    $detailSites = [];
    $villesAvecFraisAttribues = []; // Pour suivre les villes qui ont déjà reçu leur frais
    
    if ($demande->sites) {
        foreach ($demande->sites as $site) {
            $C6_site = 0;
            
            // Calcul du C6 pour ce site
            if ($site->ville && $site->ville->frais_deplacement) {
                $villeId = $site->ville->id;
                
                // Si cette ville n'a pas encore reçu son frais de déplacement
                if (!in_array($villeId, $villesAvecFraisAttribues)) {
                    $C6_site = $site->ville->frais_deplacement;
                    $villesAvecFraisAttribues[] = $villeId;
                }
                // Sinon, C6_site reste à 0 pour les autres sites de la même ville
            }
            
            // Calcul du total des postes pour ce site
            $totalPostesSite = 0;
            foreach ($detailPostes as $detailPoste) {
                if ($detailPoste['site'] === $site->code_site) {
                    $totalPostesSite += $detailPoste['total_poste'];
                }
            }
            
            $detailSites[] = [
                'site' => $site->code_site,
                'ville' => $site->ville->nom ?? 'Ville inconnue',
                'C4_rapport' => $C4,
                'C5_logistique' => $C5,
                'C6_deplacement' => $C6_site,
                'nombre_postes' => $site->postes->count(),
                'total_postes_site' => $totalPostesSite
            ];
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
                         'sites' => $demande->sites->where('ville_id', $villeId)->pluck('code_site')->toArray()
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
            // COÛTS FIXES PAR SITE
            'C4_rapport_total' => $C4_total,
            'C5_logistique_total' => $C5_total,
            'C6_deplacement_total' => $C6_total,
            'C6_villes_uniques' => $villesUniquesAvecFrais,
            
            // DÉTAIL PAR SITE
            'detail_sites' => $detailSites,
            
            // COÛTS VARIABLES (SOMME DE TOUS LES POSTES)
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
            
            // TOTAL ANALYSE (SOMME DE TOUS LES POSTES)
            'total_analyse' => $totalAnalyse,
            
            // DÉTAIL PAR POSTE (CHAQUE POSTE INDÉPENDANT)
            'detail_postes' => $detailPostes
        ],
        'regles_appliquees' => [
            'C1 (Prélèvement)' => $C1 . ' MAD par famille UNIQUE dans chaque poste',
            'C2 (Préparation)' => 'Coût de préparation par famille UNIQUE dans chaque poste',
            'C3 (Analyse)' => 'Somme des coûts d\'analyse des composants de chaque famille dans chaque poste',
            'C4 (Rapport)' => $C4 . ' MAD fixe par SITE',
            'C5 (Logistique)' => $C5 . ' MAD fixe par SITE',
            'C6 (Déplacement)' => 'Frais de déplacement UNIQUES par ville (commun aux sites de même ville)'
        ],
        'resume' => [
            'Coûts fixes (C4 + C5)' => $C4_total + $C5_total,
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
//  Calculer le coût d'un poste spécifique
 public function calculerCoutParPoste($posteId)
    {
        $poste = Poste::with([
            'produits.composants.famille',
            'site.ville'
        ])->findOrFail($posteId);
        
        $C1 = Cout::where('code', 'C1')->value('valeur') ?? 700;
        
        $coutPoste = 0;
        $detailProduits = [];
        $C1_total = 0;
        $C2_total = 0;
        $C3_total = 0;
        $famillesDansPoste = [];
        
        foreach ($poste->produits as $produit) {
            $coutProduit = 0;
            $detailFamillesProduit = [];
            
            if ($produit->composants && $produit->composants->count() > 0) {
                foreach ($produit->composants->groupBy('famille_id') as $familleId => $composantsFamille) {
                    $famille = $composantsFamille->first()->famille;
                    
                    // CORRECTION : Même logique que dans calculerCoutTotal
                    $C1_famille = 0;
                    $C2_famille = 0;
                    $C3_famille = $composantsFamille->sum('cout_analyse');
                    
                    if (!in_array($familleId, $famillesDansPoste)) {
                        $C1_famille = $C1;
                        $C2_famille = $famille->cout_preparation ?? 200;
                        
                        $C1_total += $C1_famille;
                        $C2_total += $C2_famille;
                        
                        $famillesDansPoste[] = $familleId;
                    }
                    
                    $C3_total += $C3_famille;
                    
                    $coutFamille = $C1_famille + $C2_famille + $C3_famille;
                    $coutProduit += $coutFamille;
                    
                  $detailFamillesProduit[] = [
    'famille' => $famille->libelle ?? 'Famille inconnue',
    'famille_id' => $familleId,
    'code_famille' => $famille->code ?? ($famille->code_famille ?? 'N/A'), // Code de la famille
    'code_preparation' => $famille->code_preparation ?? 'N/A', // Code préparation
    'cout_preparation' => $famille->cout_preparation ?? 0, // Coût préparation
    'C1' => $C1_famille,
    'C2' => $C2_famille,
    'C3' => $C3_famille,
    'total_famille' => $coutFamille,
    'composants' => $composantsFamille->map(function($composant) {
        return [
            'nom' => $composant->nom,
            'cas_number' => $composant->cas_number,
            'code_analyse' => $composant->code_analyse ?? ($composant->code ?? 'N/A'), // Code analyse
            'cout_analyse' => $composant->cout_analyse
        ];
    })
];
                }
            }
            
            $coutPoste += $coutProduit;
            
            $detailProduits[] = [
                'produit' => $produit->nom,
                'description' => $produit->description,
                'total_produit' => $coutProduit,
                'familles' => $detailFamillesProduit
            ];
        }
        
        $totalAnalysePoste = $C1_total + $C2_total + $C3_total;
        
        return [
            'poste' => [
                'id' => $poste->id,
                'nom' => $poste->nom_poste,
                'zone_activite' => $poste->zone_activite,
                'site' => $poste->site->nom_site,
                'ville' => $poste->site->ville->nom ?? 'Ville inconnue'
            ],
            'cout_total_poste' => $coutPoste,
            'detail' => [
                'C1_prelevement' => $C1_total,
                'C2_preparation' => $C2_total,
                'C3_analyse' => $C3_total,
                'total_analyse' => $totalAnalysePoste
            ],
            'produits' => $detailProduits,
            'statistiques' => [
                'nombre_produits' => count($detailProduits),
                'nombre_familles' => count($famillesDansPoste),
                'nombre_composants' => $poste->produits->sum(function($produit) {
                    return $produit->composants ? $produit->composants->count() : 0;
                })
            ]
        ];
    }

// 🔹 NOUVELLE FONCTION : API pour récupérer le coût d'un poste spécifique
public function getCoutPoste($posteId)
{
    return response()->json($this->calculerCoutParPoste($posteId));
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

    //  Récupérer seulement le résumé
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