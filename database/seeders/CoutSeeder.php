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
                'regle_calcul' => '700 MAD par poste et par famille de composants'
            ],
            [
                'code' => 'C2',
                'libelle' => 'Préparation',
                'type' => 'Variable', // Changé à Variable selon vos règles
                'valeur' => null, // Variable par famille
                'regle_calcul' => 'Coût fixe par famille de composants'
            ],
            [
                'code' => 'C3',
                'libelle' => 'Analyse',
                'type' => 'Variable',
                'valeur' => null,
                'regle_calcul' => 'Somme des coûts d\'analyse par composant'
            ],
            [
                'code' => 'C4',
                'libelle' => 'Rapport',
                'type' => 'Fixe',
                'valeur' => 200.00,
                'regle_calcul' => '200 MAD par affaire'
            ],
            [
                'code' => 'C5', 
                'libelle' => 'Logistique',
                'type' => 'Fixe',
                'valeur' => 300.00,
                'regle_calcul' => '300 MAD par dossier'
            ],
            [
                'code' => 'C6',
                'libelle' => 'Déplacement',
                'type' => 'Variable',
                'valeur' => null, // Sera récupéré depuis le site
                'regle_calcul' => 'Saisie manuelle par le commercial'
            ],
        ];

        foreach ($couts as $cout) {
            Cout::create($cout);
        }
    }
}