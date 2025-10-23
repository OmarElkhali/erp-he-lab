<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('couts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Ex: C1, C2, C3...
            $table->string('libelle'); // Ex: Prélèvement, Préparation, etc.
            $table->enum('type', ['Fixe', 'Variable']);
            $table->decimal('valeur', 10, 2)->nullable(); // Ex: 700.00
            $table->string('regle_calcul')->nullable(); // Description de la règle
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('couts');
    }
};
