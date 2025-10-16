<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeClient extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'date_creation',
        'statut',
        'contact_nom',
        'contact_email',
        'contact_tel',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function postes()
    {
        return $this->hasMany(PosteTravail::class, 'demande_id');
    }

    public function devis()
    {
        return $this->hasOne(Devis::class, 'demande_id');
    }
}
