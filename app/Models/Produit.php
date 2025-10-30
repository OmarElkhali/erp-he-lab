<?php
// app/Models/Produit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'poste_id',
        'nom',
        'description'
    ];

    public function poste()
    {
        return $this->belongsTo(Poste::class);
    }

    public function composants()
    {
        return $this->belongsToMany(Composant::class, 'produit_composant');
    }
}