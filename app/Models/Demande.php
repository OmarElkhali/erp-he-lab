<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_affaire',
        'ice',
        'nom_entreprise',
        'adresse',
        'contact_nom',
        'contact_prenom',
        'contact_fonction',
        'telephone',
        'email',
        'date_creation',
        'statut',
        'type_chiffrage',
        'sites',
        'postes',
        'montant_total',
        'devis_genere',
        'user_id',
        'admin_id',
        'date_validation'
    ];

    protected $casts = [
        'sites' => 'array',
        'postes' => 'array',
        'date_creation' => 'date',
        'date_validation' => 'datetime',
        'devis_genere' => 'boolean'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function devis()
    {
        return $this->hasOne(Devis::class);
    }

    // Générer un numéro d'affaire
    public static function generateNumeroAffaire($typeChiffrage)
    {
        $prefixes = [
            'air-ambiant' => 'AA',
            'rejets-atmospheriques' => 'RA',
            'amiante' => 'AM',
            'bruit-ambiant' => 'BA',
            'bruit-exposition' => 'BE',
            'co-opacite' => 'CO',
            'rejets-liquides' => 'RL',
            'eau-propre' => 'EP',
            'eclairage' => 'EC',
            'qualite-air-interieur' => 'QAI',
            'vibration' => 'VB',
            'temperature-humidite' => 'TH',
            'sol' => 'SL'
        ];

        $prefix = $prefixes[$typeChiffrage] ?? 'GE';
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', today())->count() + 1;

        return "{$prefix}{$date}v" . str_pad($count, 2, '0', STR_PAD_LEFT);
    }
}