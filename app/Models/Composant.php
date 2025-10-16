<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Composant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'cas_number',
        'famille',
        'vlep',
        'prix_analyse',
    ];

    public function postes()
    {
        return $this->belongsToMany(PosteTravail::class, 'composant_poste')
                    ->withPivot('quantite')
                    ->withTimestamps();
    }
}
