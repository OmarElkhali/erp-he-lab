<?php
// database/migrations/2025_11_05_add_code_analyse_to_composants_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('composants', function (Blueprint $table) {
            $table->string('code_analyse')->nullable()->after('cas_number');
        });
    }

    public function down()
    {
        // Schema::table('composants', function (Blueprint $table) {
        //     $table->dropColumn('code_analyse');
        // });
    }
};