<?php
// database/migrations/2024_01_06_create_composants_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('composants', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('cas_number')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('composants');
    }
};