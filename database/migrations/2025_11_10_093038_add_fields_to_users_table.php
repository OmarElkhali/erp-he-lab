<?php
// database/migrations/2024_01_10_add_fields_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nom_complet')->nullable()->after('id'); // Un seul champ pour le nom complet
            $table->string('role')->default('client')->after('password');
            $table->string('email_verification_code')->nullable()->after('role');
            $table->timestamp('email_verified_at')->nullable()->after('email_verification_code');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nom_complet', 'role', 'email_verification_code', 'email_verified_at']);
        });
    }
};