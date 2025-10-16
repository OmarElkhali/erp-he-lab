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
        Schema::create('famille_couts', function (Blueprint $table) {
            $table->string('code_famille')->primary();
            $table->string('nom_famille');
            $table->decimal('cout_preparation', 10, 2)->default(0);
            $table->string('type_support')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('famille_couts');
    }
};
