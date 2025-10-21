<?php
// database/seeders/MatriceSeeder.php
namespace Database\Seeders;

use App\Models\Matrice;
use Illuminate\Database\Seeder;

class MatriceSeeder extends Seeder
{
    public function run()
    {
        $matrices = [
            ['label' => 'Air ambiant', 'value' => 'air-ambiant', 'abreviation' => 'AIR'],
            ['label' => 'Rejets atmosphériques', 'value' => 'rejets-atmospheriques', 'abreviation' => 'REJ'],
            ['label' => 'Amiante', 'value' => 'amiante', 'abreviation' => 'AMI'],
            ['label' => 'Bruit ambiant', 'value' => 'bruit-ambiant', 'abreviation' => 'BRU'],
            ['label' => 'Bruit à l\'exposition', 'value' => 'bruit-exposition', 'abreviation' => 'BRE'],
            ['label' => 'Co.opacité', 'value' => 'co-opacite', 'abreviation' => 'COP'],
            ['label' => 'Rejets liquides', 'value' => 'rejets-liquides', 'abreviation' => 'LIQ'],
            ['label' => 'Eau propre', 'value' => 'eau-propre', 'abreviation' => 'EAU'],
            ['label' => 'Éclairage', 'value' => 'eclairage', 'abreviation' => 'ECL'],
            ['label' => 'Qualité de l\'air intérieur', 'value' => 'qualite-air-interieur', 'abreviation' => 'QAI'],
            ['label' => 'Vibration', 'value' => 'vibration', 'abreviation' => 'VIB'],
            ['label' => 'Température et humidité', 'value' => 'temperature-humidite', 'abreviation' => 'TEM'],
            ['label' => 'Sol', 'value' => 'sol', 'abreviation' => 'SOL'],
        ];

        foreach ($matrices as $matrice) {
            Matrice::create($matrice);
        }
    }
}