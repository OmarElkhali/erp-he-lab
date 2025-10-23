<?php
// database/seeders/FamilleSeeder.php
namespace Database\Seeders;

use App\Models\Famille;
use Illuminate\Database\Seeder;

class FamilleSeeder extends Seeder
{
    public function run()
    {
        $familles = [
            [
                'code' => 'B01', 
                'libelle' => 'Métaux lourds',
                'cout_preparation' => 200.00 // C2 pour cette famille
            ],
            [
                'code' => 'D01', 
                'libelle' => 'Solvants aromatiques',
                'cout_preparation' => 250.00
            ],
            [
                'code' => 'D02', 
                'libelle' => 'Solvants chlorés',
                'cout_preparation' => 300.00
            ],
            [
                'code' => 'A01', 
                'libelle' => 'Poussières',
                'cout_preparation' => 150.00
            ],
            [
                'code' => 'C01', 
                'libelle' => 'Gaz',
                'cout_preparation' => 180.00
            ],
        ];

        foreach ($familles as $famille) {
            Famille::create($famille);
        }
    }
}