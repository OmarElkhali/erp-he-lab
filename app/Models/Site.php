<?php
// app/Models/Site.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $fillable = ['entreprise_id', 'nom_site', 'ville', 'code_site'];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    public function postes()
    {
        return $this->hasMany(Poste::class);
    }
}