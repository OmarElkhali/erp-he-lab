<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('composants', function (Blueprint $table) {
            $table->foreignId('famille_id')->nullable()->constrained('familles')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('composants', function (Blueprint $table) {
            $table->dropForeign(['famille_id']);
            $table->dropColumn('famille_id');
        });
    }
};
