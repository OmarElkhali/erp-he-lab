<?php
// app/Models/Poste.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poste extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'site_id',
        'nom_poste',
        'zone_activite',
        'personnes_exposees',
        'duree_shift',
        'duree_exposition_quotidienne',
        'nb_shifts'
    ];

    // Supprimer l'ancienne relation avec composants
    // public function composants()
    // {
    //     return $this->belongsToMany(Composant::class, 'poste_composant');
    // }

    // Nouvelle relation avec produits
    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
}