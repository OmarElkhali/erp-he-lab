<?php
// database/seeders/CoutSeeder.php
namespace Database\Seeders;

use App\Models\Cout;
use Illuminate\Database\Seeder;

class CoutSeeder extends Seeder
{
    public function run()
    {
        $couts = [
            [
                'code' => 'C1',
                'libelle' => 'Prélèvement',
                'type' => 'Fixe',
                'valeur' => 700.00,
                'regle_calcul' => 'Coût fixe par poste'
            ],
            [
                'code' => 'C2',
                'libelle' => 'Préparation',
                'type' => 'Fixe', 
                'valeur' => 200.00,
                'regle_calcul' => 'Coût fixe par poste'
            ],
            [
                'code' => 'C3',
                'libelle' => 'Analyse composants',
                'type' => 'Variable',
                'valeur' => null,
                'regle_calcul' => 'Somme des coûts des composants par famille'
            ],
            [
                'code' => 'C4',
                'libelle' => 'Rapport',
                'type' => 'Fixe',
                'valeur' => 200.00,
                'regle_calcul' => 'Coût fixe par demande'
            ],
            [
                'code' => 'C5', 
                'libelle' => 'Logistique',
                'type' => 'Fixe',
                'valeur' => 300.00,
                'regle_calcul' => 'Coût fixe par demande'
            ],
            [
                'code' => 'C6',
                'libelle' => 'Déplacement',
                'type' => 'Variable',
                'valeur' => 1000.00,
                'regle_calcul' => 'Coût variable selon la distance'
            ],
        ];

        foreach ($couts as $cout) {
            Cout::create($cout);
        }
    }
}