<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_produits_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poste_id')->constrained()->onDelete('cascade');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Table pivot produit_composant
        Schema::create('produit_composant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained()->onDelete('cascade');
            $table->foreignId('composant_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('produit_composant');
        Schema::dropIfExists('produits');
    }
};