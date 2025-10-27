<?php
// database/migrations/2024_01_14_add_produit_to_postes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('postes', function (Blueprint $table) {
            $table->string('produit')->nullable()->after('nb_shifts');
        });
    }

    public function down()
    {
        Schema::table('postes', function (Blueprint $table) {
            $table->dropColumn('produit');
        });
    }
};