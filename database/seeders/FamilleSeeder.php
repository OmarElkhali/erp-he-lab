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
                'code_preparation' => 'PREP-B01',
                'libelle' => 'Métaux lourds', 
                'cout_preparation' => 200.00
            ],
            [
                'code' => 'D01', 
                'code_preparation' => 'PREP-D01',
                'libelle' => 'Solvants aromatiques', 
                'cout_preparation' => 250.00
            ],
            [
                'code' => 'D02', 
                'code_preparation' => 'PREP-D02',
                'libelle' => 'Solvants chlorés', 
                'cout_preparation' => 300.00
            ],
            [
                'code' => 'A01', 
                'code_preparation' => 'PREP-A01',
                'libelle' => 'Poussières', 
                'cout_preparation' => 150.00
            ],
            [
                'code' => 'C01', 
                'code_preparation' => 'PREP-C01',
                'libelle' => 'Gaz', 
                'cout_preparation' => 180.00
            ],
        ];

        foreach ($familles as $famille) {
            Famille::create($famille);
        }
    }
}