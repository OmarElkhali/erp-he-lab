<?php
// database/seeders/VilleSeeder.php
namespace Database\Seeders;

use App\Models\Ville;
use Illuminate\Database\Seeder;

class VilleSeeder extends Seeder
{
    public function run()
    {
        $villes = [
            ['nom' => 'Casablanca', 'frais_deplacement' => 500.00],
            ['nom' => 'Rabat', 'frais_deplacement' => 400.00],
            ['nom' => 'Marrakech', 'frais_deplacement' => 800.00],
            ['nom' => 'Tanger', 'frais_deplacement' => 900.00],
            ['nom' => 'Fès', 'frais_deplacement' => 700.00],
            ['nom' => 'Meknès', 'frais_deplacement' => 650.00],
            ['nom' => 'Agadir', 'frais_deplacement' => 1000.00],
            ['nom' => 'Oujda', 'frais_deplacement' => 1100.00],
            ['nom' => 'Salé', 'frais_deplacement' => 450.00],
            ['nom' => 'Témara', 'frais_deplacement' => 420.00],
            ['nom' => 'Mohammedia', 'frais_deplacement' => 480.00],
            ['nom' => 'Kénitra', 'frais_deplacement' => 550.00],
            ['nom' => 'Safi', 'frais_deplacement' => 850.00],
            ['nom' => 'El Jadida', 'frais_deplacement' => 600.00],
            ['nom' => 'Béni Mellal', 'frais_deplacement' => 750.00],
            ['nom' => 'Nador', 'frais_deplacement' => 1050.00],
            ['nom' => 'Tétouan', 'frais_deplacement' => 950.00],
            ['nom' => 'Larache', 'frais_deplacement' => 900.00],
            ['nom' => 'Khouribga', 'frais_deplacement' => 680.00],
            ['nom' => 'Settat', 'frais_deplacement' => 520.00],
        ];

        foreach ($villes as $ville) {
            Ville::create($ville);
        }
    }
}