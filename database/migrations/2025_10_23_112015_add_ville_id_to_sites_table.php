<?php
// database/migrations/2025_10_23_112015_add_ville_id_to_sites_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sites', function (Blueprint $table) {
            // Vérifier si les colonnes existent avant de les supprimer
            if (Schema::hasColumn('sites', 'ville')) {
                $table->dropColumn('ville');
            }
            
            if (Schema::hasColumn('sites', 'frais_deplacement')) {
                $table->dropColumn('frais_deplacement');
            }
            
            // Ajouter la nouvelle colonne ville_id
            $table->foreignId('ville_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('sites', function (Blueprint $table) {
            $table->dropForeign(['ville_id']);
            $table->dropColumn('ville_id');
            
            // Recréer les anciennes colonnes si nécessaire
            $table->string('ville')->nullable();
            $table->decimal('frais_deplacement', 10, 2)->default(0);
        });
    }
};