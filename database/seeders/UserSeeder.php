<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer l'utilisateur admin
        User::create([
            'nom' => 'Admin',
            'prenom' => 'System',
            'email' => 'admin@hse-lab.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Créer l'utilisateur standard
        User::create([
            'nom' => 'User',
            'prenom' => 'Standard',
            'email' => 'user@hse-lab.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
        ]);
    }
}