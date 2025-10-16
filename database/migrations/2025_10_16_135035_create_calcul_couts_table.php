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
        Schema::create('calcul_couts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poste_id')->constrained('postes')->onDelete('cascade');
            $table->string('famille_code');
            $table->foreign('famille_code')->references('code_famille')->on('famille_couts')->onDelete('cascade');
            $table->decimal('cout_c1', 10, 2)->default(0);
            $table->decimal('cout_c2', 10, 2)->default(0);
            $table->decimal('cout_c3', 10, 2)->default(0);
            $table->decimal('sous_total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calcul_couts');
    }
};
