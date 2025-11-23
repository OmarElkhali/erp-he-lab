<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sauvegardes', function (Blueprint $table) {
            // Supprimer la contrainte unique pour permettre plusieurs sauvegardes par matrice
            $table->dropUnique(['user_id', 'matrice_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sauvegardes', function (Blueprint $table) {
            // Remettre la contrainte unique si rollback
            $table->unique(['user_id', 'matrice_id']);
        });
    }
};
