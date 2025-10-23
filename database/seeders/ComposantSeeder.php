<?php
// database/seeders/ComposantSeeder.php
namespace Database\Seeders;

use App\Models\Composant;
use App\Models\Famille;
use Illuminate\Database\Seeder;

class ComposantSeeder extends Seeder
{
    public function run()
    {
        $familleB01 = Famille::where('code', 'B01')->first();
        $familleD01 = Famille::where('code', 'D01')->first();
        $familleD02 = Famille::where('code', 'D02')->first();
        $familleA01 = Famille::where('code', 'A01')->first();
        $familleC01 = Famille::where('code', 'C01')->first();

        $composants = [
            // Métaux lourds - B01
            ['nom' => 'Nickel', 'cas_number' => '7440-02-0', 'famille_id' => $familleB01->id, 'cout_analyse' => 100.00],
            ['nom' => 'Plomb', 'cas_number' => '7439-92-1', 'famille_id' => $familleB01->id, 'cout_analyse' => 120.00],
            ['nom' => 'Cadmium', 'cas_number' => '7440-43-9', 'famille_id' => $familleB01->id, 'cout_analyse' => 150.00],
            ['nom' => 'Chrome', 'cas_number' => '7440-47-3', 'famille_id' => $familleB01->id, 'cout_analyse' => 110.00],
            ['nom' => 'Mercure', 'cas_number' => '7439-97-6', 'famille_id' => $familleB01->id, 'cout_analyse' => 200.00],
            
            // Solvants aromatiques - D01
            ['nom' => 'Benzène', 'cas_number' => '71-43-2', 'famille_id' => $familleD01->id, 'cout_analyse' => 180.00],
            ['nom' => 'Toluène', 'cas_number' => '108-88-3', 'famille_id' => $familleD01->id, 'cout_analyse' => 160.00],
            ['nom' => 'Xylène', 'cas_number' => '1330-20-7', 'famille_id' => $familleD01->id, 'cout_analyse' => 150.00],
            ['nom' => 'Ethylbenzène', 'cas_number' => '100-41-4', 'famille_id' => $familleD01->id, 'cout_analyse' => 170.00],
            
            // Solvants chlorés - D02
            ['nom' => 'Trichloréthylène', 'cas_number' => '79-01-6', 'famille_id' => $familleD02->id, 'cout_analyse' => 190.00],
            ['nom' => 'Perchloréthylène', 'cas_number' => '127-18-4', 'famille_id' => $familleD02->id, 'cout_analyse' => 200.00],
            ['nom' => 'Chloroforme', 'cas_number' => '67-66-3', 'famille_id' => $familleD02->id, 'cout_analyse' => 160.00],
            
            // Poussières - A01
            ['nom' => 'Poussières totales', 'cas_number' => null, 'famille_id' => $familleA01->id, 'cout_analyse' => 80.00],
            ['nom' => 'Poussières alvéolaires', 'cas_number' => null, 'famille_id' => $familleA01->id, 'cout_analyse' => 90.00],
            
            // Gaz - C01
            ['nom' => 'Monoxyde de carbone', 'cas_number' => '630-08-0', 'famille_id' => $familleC01->id, 'cout_analyse' => 100.00],
            ['nom' => 'Dioxyde de soufre', 'cas_number' => '7446-09-5', 'famille_id' => $familleC01->id, 'cout_analyse' => 110.00],
            ['nom' => 'Dioxyde d\'azote', 'cas_number' => '10102-44-0', 'famille_id' => $familleC01->id, 'cout_analyse' => 120.00],
            ['nom' => 'Formaldéhyde', 'cas_number' => '50-00-0', 'famille_id' => $familleC01->id, 'cout_analyse' => 150.00],
        ];

        foreach ($composants as $composant) {
            Composant::create($composant);
        }
    }
}