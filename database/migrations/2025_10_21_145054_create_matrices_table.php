<?php
// database/migrations/2024_01_01_create_matrices_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('matrices', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('value')->unique();
            $table->string('abreviation')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('matrices');
    }
};