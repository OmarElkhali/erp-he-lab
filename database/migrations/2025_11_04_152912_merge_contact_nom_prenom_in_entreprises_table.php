<?php
// database/migrations/2024_01_10_merge_contact_nom_prenom_in_entreprises_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Ajouter la nouvelle colonne nom_prenom
        Schema::table('entreprises', function (Blueprint $table) {
            $table->string('nom_prenom')->nullable()->after('adresse');
        });
        DB::statement("
            UPDATE entreprises 
            SET nom_prenom = CONCAT(contact_nom, ' ', contact_prenom)
            WHERE contact_nom IS NOT NULL AND contact_prenom IS NOT NULL
        ");

        // 3. Supprimer les anciennes colonnes
        Schema::table('entreprises', function (Blueprint $table) {
            $table->dropColumn(['contact_nom', 'contact_prenom']);
        });
    }

    public function down()
    {
        // 1. Recréer les anciennes colonnes
        Schema::table('entreprises', function (Blueprint $table) {
            $table->string('contact_nom')->nullable()->after('adresse');
            $table->string('contact_prenom')->nullable()->after('contact_nom');
        });

        // 2. Tenter de séparer les données (approximation)
        DB::statement("
            UPDATE entreprises 
            SET 
                contact_nom = SUBSTRING_INDEX(nom_prenom, ' ', 1),
                contact_prenom = SUBSTRING(nom_prenom, LENGTH(SUBSTRING_INDEX(nom_prenom, ' ', 1)) + 2)
            WHERE nom_prenom IS NOT NULL
        ");

        // 3. Supprimer la nouvelle colonne
        Schema::table('entreprises', function (Blueprint $table) {
            $table->dropColumn('nom_prenom');
        });
    }
};