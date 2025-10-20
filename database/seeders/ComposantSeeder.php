<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Composant;

class ComposantSeeder extends Seeder
{
    public function run(): void
    {
        $composants = [
            [
                'nom' => 'Acide Sulfurique',
                'cas_number' => '7664-93-9',
                'famille' => 'Acides',
                'vlep' => 1, 
                'prix_analyse' => 50.0,
            ],
            [
                'nom' => 'Chlorure de Sodium',
                'cas_number' => '7647-14-5',
                'famille' => 'Sels',
                'vlep' => 5,
                'prix_analyse' => 10.0,
            ],
            [
                'nom' => 'Benzène',
                'cas_number' => '71-43-2',
                'famille' => 'Hydrocarbures aromatiques',
                'vlep' => 0.5,
                'prix_analyse' => 100.0,
            ],
            [
                'nom' => 'Plomb',
                'cas_number' => '7439-92-1',
                'famille' => 'Métaux lourds',
                'vlep' => 0.05,
                'prix_analyse' => 80.0,
            ],
            [
                'nom' => 'Ammoniaque',
                'cas_number' => '7664-41-7',
                'famille' => 'Bases',
                'vlep' => 25,
                'prix_analyse' => 30.0,
            ],
        ];

        foreach ($composants as $composant) {
            Composant::create($composant);
        }
    }
}
