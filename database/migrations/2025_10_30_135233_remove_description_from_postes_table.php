<?php
// database/migrations/xxxx_xx_xx_xxxxxx_remove_description_from_postes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('postes', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->dropColumn('produit');
        });
    }

    public function down()
    {
        Schema::table('postes', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('produit')->nullable();
        });
    }
};