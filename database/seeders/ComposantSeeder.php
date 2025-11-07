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
        // Récupérer les familles
        $metaux = Famille::where('code', 'B01')->first();
        $solvantsAromatiques = Famille::where('code', 'D01')->first();
        $solvantsChlores = Famille::where('code', 'D02')->first();
        $poussieres = Famille::where('code', 'A01')->first();
        $gaz = Famille::where('code', 'C01')->first();

        $composants = [
            // Métaux lourds
            ['nom' => 'Nickel', 'cas_number' => '7440-02-0', 'code_analyse' => 'MET-NI', 'cout_analyse' => 100.00, 'famille_id' => $metaux->id],
            ['nom' => 'Plomb', 'cas_number' => '7439-92-1', 'code_analyse' => 'MET-PB', 'cout_analyse' => 120.00, 'famille_id' => $metaux->id],
            ['nom' => 'Cadmium', 'cas_number' => '7440-43-9', 'code_analyse' => 'MET-CD', 'cout_analyse' => 150.00, 'famille_id' => $metaux->id],
            ['nom' => 'Chrome', 'cas_number' => '7440-47-3', 'code_analyse' => 'MET-CR', 'cout_analyse' => 110.00, 'famille_id' => $metaux->id],
            ['nom' => 'Mercure', 'cas_number' => '7439-97-6', 'code_analyse' => 'MET-HG', 'cout_analyse' => 200.00, 'famille_id' => $metaux->id],

            // Solvants aromatiques
            ['nom' => 'Benzène', 'cas_number' => '71-43-2', 'code_analyse' => 'SOLV-BZ', 'cout_analyse' => 180.00, 'famille_id' => $solvantsAromatiques->id],
            ['nom' => 'Toluène', 'cas_number' => '108-88-3', 'code_analyse' => 'SOLV-TOL', 'cout_analyse' => 160.00, 'famille_id' => $solvantsAromatiques->id],
            ['nom' => 'Xylène', 'cas_number' => '1330-20-7', 'code_analyse' => 'SOLV-XYL', 'cout_analyse' => 150.00, 'famille_id' => $solvantsAromatiques->id],
            ['nom' => 'Ethylbenzène', 'cas_number' => '100-41-4', 'code_analyse' => 'SOLV-ETB', 'cout_analyse' => 170.00, 'famille_id' => $solvantsAromatiques->id],

            // Solvants chlorés
            ['nom' => 'Trichloréthylène', 'cas_number' => '79-01-6', 'code_analyse' => 'SOLV-TCE', 'cout_analyse' => 190.00, 'famille_id' => $solvantsChlores->id],
            ['nom' => 'Perchloréthylène', 'cas_number' => '127-18-4', 'code_analyse' => 'SOLV-PCE', 'cout_analyse' => 200.00, 'famille_id' => $solvantsChlores->id],
            ['nom' => 'Chloroforme', 'cas_number' => '67-66-3', 'code_analyse' => 'SOLV-CHL', 'cout_analyse' => 160.00, 'famille_id' => $solvantsChlores->id],

            // Poussières
            ['nom' => 'Poussières totales', 'cas_number' => null, 'code_analyse' => 'POUS-TOT', 'cout_analyse' => 80.00, 'famille_id' => $poussieres->id],
            ['nom' => 'Poussières alvéolaires', 'cas_number' => null, 'code_analyse' => 'POUS-ALV', 'cout_analyse' => 90.00, 'famille_id' => $poussieres->id],

            // Gaz
            ['nom' => 'Monoxyde de carbone', 'cas_number' => '630-08-0', 'code_analyse' => 'GAZ-CO', 'cout_analyse' => 100.00, 'famille_id' => $gaz->id],
            ['nom' => 'Dioxyde de soufre', 'cas_number' => '7446-09-5', 'code_analyse' => 'GAZ-SO2', 'cout_analyse' => 110.00, 'famille_id' => $gaz->id],
            ['nom' => 'Dioxyde d\'azote', 'cas_number' => '10102-44-0', 'code_analyse' => 'GAZ-NO2', 'cout_analyse' => 120.00, 'famille_id' => $gaz->id],
            ['nom' => 'Formaldéhyde', 'cas_number' => '50-00-0', 'code_analyse' => 'GAZ-FORM', 'cout_analyse' => 150.00, 'famille_id' => $gaz->id],
        ];

        foreach ($composants as $composant) {
            Composant::create($composant);
        }
    }
}