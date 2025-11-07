<?php
// database/migrations/2025_11_07_084655_add_code_preparation_to_familles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('familles', function (Blueprint $table) {
            $table->string('code_preparation')->nullable()->after('code');
        });
    }

    public function down()
    {
        // Schema::table('familles', function (Blueprint $table) {
        //     $table->dropColumn('code_preparation');
        // });
    }
};