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
    // Récupération des coûts depuis la BDD
    $C1 = Cout::where('code', 'C1')->value('valeur') ?? 700; // Prélèvement - FIXE par poste et famille
    $C4 = Cout::where('code', 'C4')->value('valeur') ?? 200; // Rapport - FIXE par affaire
    $C5 = Cout::where('code', 'C5')->value('valeur') ?? 300; // Logistique - FIXE par dossier
    
    // C2 doit être par famille, donc on le récupère différemment
    $coutsFamilles = [
        'B01' => 200, // Métaux lourds
        'D01' => 250, // Solvants aromatiques  
        'D02' => 300, // Solvants chlorés
        'A01' => 150, // Poussières
        'C01' => 180, // Gaz
    ];
    
    // C6 - Déplacement (saisie manuelle, à stocker dans la demande)
    $C6 = $demande->frais_deplacement ?? 0;

    $totalPostes = 0;
    $detailPostes = [];

    foreach ($demande->postes as $posteIndex => $poste) {
        // Regrouper les composants par famille
        $familles = $poste->composants->groupBy('famille.code');
        
        $coutPoste = 0;
        $detailFamilles = [];

        foreach ($familles as $codeFamille => $composantsFamille) {
            // C1: Prélèvement - 700 MAD par poste ET par famille
            $coutC1 = $C1;
            
            // C2: Préparation - Coût fixe par famille
            $coutC2 = $coutsFamilles[$codeFamille] ?? 200;
            
            // C3: Analyse - Somme des coûts d'analyse par composant
            $coutC3 = $composantsFamille->sum('cout_analyse');
            
            $coutFamille = $coutC1 + $coutC2 + $coutC3;
            $coutPoste += $coutFamille;
            
            $detailFamilles[$codeFamille] = [
                'C1' => $coutC1,
                'C2' => $coutC2, 
                'C3' => $coutC3,
                'total_famille' => $coutFamille
            ];
        }
        
        $totalPostes += $coutPoste;
        $detailPostes[$posteIndex] = [
            'nom_poste' => $poste->nom_poste,
            'total_poste' => $coutPoste,
            'familles' => $detailFamilles
        ];
    }

    $prixTotal = $C4 + $C5 + $totalPostes + $C6;
    
    return [
        'total' => $prixTotal,
        'detail' => [
            'C1_total' => $C1 * array_reduce($detailPostes, function($carry, $poste) {
                return $carry + count($poste['familles']);
            }, 0),
            'C2_total' => array_reduce($detailPostes, function($carry, $poste) {
                return $carry + array_sum(array_column($poste['familles'], 'C2'));
            }, 0),
            'C3_total' => array_reduce($detailPostes, function($carry, $poste) {
                return $carry + array_sum(array_column($poste['familles'], 'C3'));
            }, 0),
            'C4' => $C4,
            'C5' => $C5,
            'C6' => $C6,
            'total_postes' => $totalPostes,
            'detail_postes' => $detailPostes
        ]
    ];
}

    // Nouvelle méthode pour récupérer le coût d'une demande
    public function getCoutDemande($demandeId)
    {
        $demande = Demande::with(['postes.composants.famille'])->findOrFail($demandeId);
        return response()->json($this->calculerCoutTotal($demande));
    }
}