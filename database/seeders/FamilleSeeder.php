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
            ['code' => 'B01', 'libelle' => 'Métaux lourds'],
            ['code' => 'D01', 'libelle' => 'Solvants aromatiques'],
            ['code' => 'D02', 'libelle' => 'Solvants chlorés'],
            ['code' => 'A01', 'libelle' => 'Poussières'],
            ['code' => 'C01', 'libelle' => 'Gaz'],
        ];

        foreach ($familles as $famille) {
            Famille::create($famille);
        }
    }
}