<?php
// database/migrations/2024_01_11_remove_site_id_from_demandes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('demandes', function (Blueprint $table) {
            // Supprimer la clé étrangère d'abord
            $table->dropForeign(['site_id']);
            // Puis supprimer la colonne
            $table->dropColumn('site_id');
        });
    }

    public function down()
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->foreignId('site_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};