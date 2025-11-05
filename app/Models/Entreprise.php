<?php
// app/Models/Entreprise.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    use HasFactory;

    protected $fillable = [
        'ice', 'nom', 'adresse', 'nom_prenom',
        'contact_fonction', 'telephone', 'email'
    ];

    public function sites()
    {
        return $this->hasMany(Site::class);
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }
}