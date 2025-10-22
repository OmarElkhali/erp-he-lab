<?php
// app/Models/Demande.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_affaire', 'user_id', 'entreprise_id', 'matrice_id', 'site_id',
        'date_creation', 'statut', 'contact_nom_demande', 
        'contact_email_demande', 'contact_tel_demande'
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
            
            // Assigner l'utilisateur connecté si user_id n'est pas déjà défini
            if (auth()->check() && !$demande->user_id) {
                $demande->user_id = auth()->id();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function matrice()
    {
        return $this->belongsTo(Matrice::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function postes()
    {
        return $this->hasMany(Poste::class);
    }
}