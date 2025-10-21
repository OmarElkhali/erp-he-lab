<?php
// database/migrations/2024_01_05_create_postes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('postes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->string('nom_poste');
            $table->string('zone_activite');
            $table->text('description');
            $table->integer('personnes_exposees');
            $table->decimal('duree_shift', 5, 2);
            $table->decimal('duree_exposition_quotidienne', 5, 2);
            $table->integer('nb_shifts');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('postes');
    }
};