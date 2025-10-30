<?php
// app/Models/Composant.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Composant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'cas_number',
        'cout_analyse',
        'famille_id'
    ];

    // Nouvelle relation avec produits
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'produit_composant');
    }

    public function famille()
    {
        return $this->belongsTo(Famille::class);
    }
}