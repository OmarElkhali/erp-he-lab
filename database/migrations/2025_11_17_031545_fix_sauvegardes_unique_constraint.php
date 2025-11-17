<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Étape 1: Supprimer les clés étrangères temporairement
        Schema::table('sauvegardes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['matrice_id']);
        });

        // Étape 2: Supprimer la contrainte unique
        DB::statement('ALTER TABLE sauvegardes DROP INDEX sauvegardes_user_id_matrice_id_unique');

        // Étape 3: Recréer les clés étrangères
        Schema::table('sauvegardes', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('matrice_id')->references('id')->on('matrices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remettre la contrainte unique si rollback nécessaire
        Schema::table('sauvegardes', function (Blueprint $table) {
            $table->unique(['user_id', 'matrice_id']);
        });
    }
};
