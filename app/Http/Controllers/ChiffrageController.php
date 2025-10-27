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
        $C6 = $demande->site->ville->frais_deplacement ?? 0;

        $totalPostes = 0;
        $detailPostes = [];
        $totalFamilles = 0;

        foreach ($demande->postes as $posteIndex => $poste) {
            // Regrouper les composants par famille
            $familles = $poste->composants->groupBy('famille_id');
            
            $coutPoste = 0;
            $detailFamilles = [];

            foreach ($familles as $familleId => $composantsFamille) {
                $famille = $composantsFamille->first()->famille;
                
                // C1: Prélèvement - 700 MAD par poste et par famille
                $C1_famille = $C1;
                
                // C2: Préparation - Coût fixe par famille
                $C2_famille = $famille->cout_preparation ?? 200;
                
                // C3: Analyse - Somme des coûts d'analyse par composant
                $C3_famille = $composantsFamille->sum('cout_analyse');
                
                $coutFamille = $C1_famille + $C2_famille + $C3_famille;
                $coutPoste += $coutFamille;
                $totalFamilles++;

                $detailFamilles[] = [
                    'famille' => $famille->libelle,
                    'C1' => $C1_famille,
                    'C2' => $C2_famille,
                    'C3' => $C3_famille,
                    'total_famille' => $coutFamille,
                    'composants_count' => $composantsFamille->count()
                ];
            }
            
            $totalPostes += $coutPoste;
            $detailPostes[] = [
                'poste' => $poste->nom_poste,
                'total_poste' => $coutPoste,
                'familles' => $detailFamilles
            ];
        }

        // Calcul du prix total selon la formule
        $prixTotal = $C4 + $C5 + $totalPostes + $C6;
        
        return [
            'total' => $prixTotal,
            'detail' => [
                'C1_total' => $C1 * $totalFamilles,
                'C2_total' => collect($detailPostes)->sum(function($poste) {
                    return collect($poste['familles'])->sum('C2');
                }),
                'C3_total' => collect($detailPostes)->sum(function($poste) {
                    return collect($poste['familles'])->sum('C3');
                }),
                'C4' => $C4,
                'C5' => $C5,
                'C6' => $C6,
                'total_postes' => $totalPostes,
                'total_familles' => $totalFamilles,
                'detail_postes' => $detailPostes,
                'formule' => 'Prix Total = C4 + C5 + Σ[(C1 + C2 + C3) pour chaque famille dans chaque poste] + C6'
            ]
        ];
    }

    public function getCoutDemande($demandeId)
    {
        $demande = Demande::with(['site.ville', 'postes.composants.famille'])->findOrFail($demandeId);
        return response()->json($this->calculerCoutTotal($demande));
    }
}