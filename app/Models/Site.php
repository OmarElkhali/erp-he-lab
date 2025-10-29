<?php
// app/Models/Site.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id', 'demande_id', 'nom_site', 'ville_id', 'code_site'
    ];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function ville()
    {
        return $this->belongsTo(Ville::class);
    }

    // NOUVELLE RELATION : Postes de ce site
    public function postes()
    {
        return $this->hasMany(Poste::class);
    }
}