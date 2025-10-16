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
        Schema::create('entreprises', function (Blueprint $table) {
           $table->id();
            $table->string('ice')->unique();
            $table->string('nom');
            $table->string('adresse');
            $table->string('contact_nom');
            $table->string('contact_prenom')->nullable();
            $table->string('contact_fonction')->nullable();
            $table->string('telephone');
            $table->string('email')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entreprises');
    }
};
