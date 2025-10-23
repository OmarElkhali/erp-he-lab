<?php
// database/migrations/2024_01_12_add_cout_preparation_to_familles_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('familles', function (Blueprint $table) {
            $table->decimal('cout_preparation', 10, 2)->default(0)->after('libelle');
        });
    }

    public function down()
    {
        Schema::table('familles', function (Blueprint $table) {
            $table->dropColumn('cout_preparation');
        });
    }
};