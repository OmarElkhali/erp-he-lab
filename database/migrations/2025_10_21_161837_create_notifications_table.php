<?php
// database/migrations/2024_01_09_create_notifications_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // nouvelle_demande, etc.
            $table->json('data'); // Données de la notification
            $table->boolean('is_read')->default(false);
            $table->boolean('is_accepted')->nullable(); // null = en attente, true = acceptée, false = refusée
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};