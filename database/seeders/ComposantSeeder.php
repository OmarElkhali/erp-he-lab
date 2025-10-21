<?php
// database/seeders/ComposantSeeder.php
namespace Database\Seeders;

use App\Models\Composant;
use Illuminate\Database\Seeder;

class ComposantSeeder extends Seeder
{
    public function run()
    {
        $composants = [
            ['nom' => 'Benzène', 'cas_number' => '71-43-2'],
            ['nom' => 'Toluène', 'cas_number' => '108-88-3'],
            ['nom' => 'Xylène', 'cas_number' => '1330-20-7'],
            ['nom' => 'Formaldéhyde', 'cas_number' => '50-00-0'],
            ['nom' => 'Plomb', 'cas_number' => '7439-92-1'],
            ['nom' => 'Mercure', 'cas_number' => '7439-97-6'],
            ['nom' => 'Cadmium', 'cas_number' => '7440-43-9'],
            ['nom' => 'Chrome', 'cas_number' => '7440-47-3'],
            ['nom' => 'Nickel', 'cas_number' => '7440-02-0'],
            ['nom' => 'Arsenic', 'cas_number' => '7440-38-2'],
            ['nom' => 'Poussières totales', 'cas_number' => null],
            ['nom' => 'Poussières alvéolaires', 'cas_number' => null],
            ['nom' => 'Monoxyde de carbone', 'cas_number' => '630-08-0'],
            ['nom' => 'Dioxyde de soufre', 'cas_number' => '7446-09-5'],
            ['nom' => 'Dioxyde d\'azote', 'cas_number' => '10102-44-0'],
        ];

        foreach ($composants as $composant) {
            Composant::create($composant);
        }
    }
}