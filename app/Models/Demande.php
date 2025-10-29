<?php
// app/Models/Demande.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_affaire', 'entreprise_id', 'matrice_id', 'user_id',
        'date_creation', 'statut', 'contact_nom_demande', 
        'contact_email_demande', 'contact_tel_demande'
        // 'site_id' SUPPRIMÉ
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($demande) {
            $date = now()->format('Ymd');
            $matrice = Matrice::find($demande->matrice_id);
            $abreviation = $matrice ? $matrice->abreviation : 'GEN';
            
            $lastDemande = Demande::whereDate('created_at', today())->count();
            $increment = str_pad($lastDemande + 1, 3, '0', STR_PAD_LEFT);
            
            $demande->code_affaire = "HT-{$date}-{$increment}-{$abreviation}";
        });
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function matrice()
    {
        return $this->belongsTo(Matrice::class);
    }

    // SUPPRIMER la méthode site() si elle existe
    // public function site()
    // {
    //     return $this->belongsTo(Site::class);
    // }

    // GARDER : Tous les sites de la demande
    public function sites()
    {
        return $this->hasMany(Site::class);
    }

    // GARDER : Tous les postes (via les sites)
    public function postes()
    {
        return $this->hasMany(Poste::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // NOUVELLE MÉTHODE : Premier site (pour compatibilité)
    public function premierSite()
    {
        return $this->sites()->first();
    }

    // NOUVELLE MÉTHODE : Nombre de sites
    public function getNombreSitesAttribute()
    {
        return $this->sites()->count();
    }

    // NOUVELLE MÉTHODE : Nombre total de postes
    public function getNombrePostesAttribute()
    {
        return $this->postes()->count();
    }
}