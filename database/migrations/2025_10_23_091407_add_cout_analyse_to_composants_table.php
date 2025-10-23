<?php
// database/migrations/2024_01_10_add_cout_analyse_to_composants_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('composants', function (Blueprint $table) {
            $table->decimal('cout_analyse', 10, 2)->default(0)->after('cas_number');
        });
    }

    public function down()
    {
        Schema::table('composants', function (Blueprint $table) {
            $table->dropColumn('cout_analyse');
        });
    }
};