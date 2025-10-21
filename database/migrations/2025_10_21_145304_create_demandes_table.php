<?php
// database/migrations/2024_01_04_create_demandes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('code_affaire')->unique();
            $table->foreignId('entreprise_id')->constrained()->onDelete('cascade');
            $table->foreignId('matrice_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->date('date_creation');
            $table->enum('statut', ['en_attente', 'acceptee', 'refusee', 'en_cours', 'terminee'])->default('en_attente');
            $table->string('contact_nom_demande');
            $table->string('contact_email_demande');
            $table->string('contact_tel_demande');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('demandes');
    }
};