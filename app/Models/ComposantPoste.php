<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'numero_devis',
        'statut',
        'montant_total',
        'valide_par',
        'date_validation',
    ];

    public function demande()
    {
        return $this->belongsTo(Demande::class, 'demande_id');
    }
}
