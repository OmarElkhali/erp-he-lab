<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('familles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // ex: B01, D01
            $table->string('libelle'); // ex: Métaux lourds, Solvants aromatiques
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('familles');
    }
};
