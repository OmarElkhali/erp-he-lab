<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosteTravail extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'nom_poste',
        'zone_activite',
        'description',
        'personnes_exposees',
        'duree_shift',
        'nb_shifts',
        'protection',
    ];

    public function demande()
    {
        return $this->belongsTo(Demande::class, 'demande_id');
    }

    public function composants()
    {
        return $this->belongsToMany(Composant::class, 'composant_poste')
                    ->withPivot('quantite')
                    ->withTimestamps();
    }

    public function calculCouts()
    {
        return $this->hasMany(CalculCout::class);
    }
}
