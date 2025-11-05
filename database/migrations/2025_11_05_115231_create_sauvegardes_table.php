<?php
// database/migrations/2024_01_10_create_sauvegardes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sauvegardes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('matrice_id')->constrained()->onDelete('cascade');
            $table->string('nom_sauvegarde');
            $table->json('data');
            $table->integer('current_step')->default(1);
            $table->enum('statut', ['brouillon', 'soumis'])->default('brouillon');
            $table->timestamps();

            $table->unique(['user_id', 'matrice_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sauvegardes');
    }
};