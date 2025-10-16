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
        Schema::create('postes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
            $table->string('nom_poste');
            $table->string('zone_activite');
            $table->text('description')->nullable();
            $table->integer('personnes_exposees');
            $table->float('duree_shift')->comment('Durée d’exposition quotidienne en heures');
            $table->integer('nb_shifts')->default(1);
            $table->string('protection')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('postes');
    }
};
