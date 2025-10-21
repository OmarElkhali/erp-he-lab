<?php
// app/Models/Composant.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Composant extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'cas_number'];

    public function postes()
    {
        return $this->belongsToMany(Poste::class, 'poste_composant');
    }
}