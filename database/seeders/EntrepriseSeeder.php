<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntrepriseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('entreprises')->insert([
            [
                'ice' => '0012458790001',
                'nom' => 'Laboratoire Atlas Environnement',
                'adresse' => 'Zone Industrielle Sidi Ghanem, Marrakech',
                'contact_nom' => 'El Amrani',
                'contact_prenom' => 'Youssef',
                'contact_fonction' => 'Responsable HSE',
                'telephone' => '0612345678',
                'email' => 'contact@atlas-env.ma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ice' => '0025896410002',
                'nom' => 'EcoAnalyse SARL',
                'adresse' => 'Technopark Casablanca, Bd Al Qods',
                'contact_nom' => 'Benali',
                'contact_prenom' => 'Sara',
                'contact_fonction' => 'Directrice Technique',
                'telephone' => '0623456789',
                'email' => 'sara.benali@ecoanalyse.ma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ice' => '0031478520003',
                'nom' => 'EnviroLab Maroc',
                'adresse' => 'Parc Industriel Ain Sebaâ, Casablanca',
                'contact_nom' => 'Tazi',
                'contact_prenom' => 'Hamza',
                'contact_fonction' => 'Chef de Projet QAI',
                'telephone' => '0634567890',
                'email' => 'hamza.tazi@envirolab.ma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ice' => '0049632580004',
                'nom' => 'BioSafe Consulting',
                'adresse' => 'Avenue Mohammed VI, Rabat',
                'contact_nom' => 'Zerhouni',
                'contact_prenom' => 'Imane',
                'contact_fonction' => 'Consultante Sécurité',
                'telephone' => '0645678901',
                'email' => 'imane.zerhouni@biosafe.ma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ice' => '0057896540005',
                'nom' => 'GreenTech Analyse',
                'adresse' => 'Quartier Industriel Al Fida, Casablanca',
                'contact_nom' => 'Ouazzani',
                'contact_prenom' => 'Nabil',
                'contact_fonction' => 'Ingénieur Environnement',
                'telephone' => '0656789012',
                'email' => 'nabil.ouazzani@greentech.ma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
