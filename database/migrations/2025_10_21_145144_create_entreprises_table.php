<?php
// database/migrations/2024_01_02_create_entreprises_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('entreprises', function (Blueprint $table) {
            $table->id();
            $table->string('ice')->unique();
            $table->string('nom');
            $table->text('adresse');
            $table->string('contact_nom');
            $table->string('contact_prenom');
            $table->string('contact_fonction');
            $table->string('telephone');
            $table->string('email');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('entreprises');
    }
};