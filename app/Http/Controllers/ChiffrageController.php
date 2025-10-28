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
        
        // C6 (Déplacement) récupéré depuis le site
        $C6 = $demande->site->frais_deplacement ?? 0;

        $totalPostes = 0;
        $detailPostes = [];
        
        // Regrouper toutes les familles UNIQUES de tous les postes
        $famillesUniques = collect();
        $composantsParFamille = collect();

        // Première passe : collecter toutes les familles uniques
        foreach ($demande->postes as $poste) {
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
        foreach ($demande->postes as $posteIndex => $poste) {
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
                'produit' => $poste->produit, 
                'total_poste' => $coutPoste,
                'familles' => $detailFamilles
            ];
        }

        // AJOUTER les coûts C1 et C2 UNIQUES au total des postes
        $totalPostes += $C1_total + $C2_total;

        // 🔹 NOUVELLE FONCTIONNALITÉ : Calcul avec et sans déplacement
        $prixTotalAvecDeplacement = $C4 + $C5 + $totalPostes + $C6;
        $prixTotalSansDeplacement = $C4 + $C5 + $totalPostes; // Sans C6
        
        return  [
            'total' => $prixTotalAvecDeplacement, // 🔹 CHANGEMENT ICI
            'total_avec_deplacement' => $prixTotalAvecDeplacement,
            'total_sans_deplacement' => $prixTotalSansDeplacement,
            'detail' => [
                'C1_total' => $C1_total,
                'C2_total' => $C2_total,
                'C3_total' => $C3_total,
                'C4' => $C4,
                'C5' => $C5,
                'C6' => $C6,
                'total_postes' => $totalPostes,
                'detail_postes' => $detailPostes,
                'familles_uniques' => $famillesUniques->count()
            ],
            'regles_appliquees' => [
                'C1' => '700 MAD par famille unique (même si présente dans plusieurs postes)',
                'C2' => 'Coût fixe par famille unique',
                'C3' => 'Somme des coûts d\'analyse de tous les composants',
                'C4' => '200 MAD fixe par demande',
                'C5' => '300 MAD fixe par demande',
                'C6' => 'Frais de déplacement du site'
            ]
        ];
        
    }

    // 🔹 NOUVELLE FONCTION : Calcul uniquement sans déplacement
    public function calculerCoutSansDeplacement(Demande $demande)
    {
        $resultat = $this->calculerCoutTotal($demande);
        return $resultat['total_sans_deplacement'];
    }

    public function getCoutDemande($demandeId)
    {
        $demande = Demande::with(['site', 'postes.composants.famille'])->findOrFail($demandeId);
        return response()->json($this->calculerCoutTotal($demande));
    }

    // 🔹 NOUVELLE FONCTION : Récupérer uniquement le coût sans déplacement
    public function getCoutSansDeplacement($demandeId)
    {
        $demande = Demande::with(['site', 'postes.composants.famille'])->findOrFail($demandeId);
        $coutSansDeplacement = $this->calculerCoutSansDeplacement($demande);
        
        return response()->json([
            'total_sans_deplacement' => $coutSansDeplacement
        ]);
    }
}