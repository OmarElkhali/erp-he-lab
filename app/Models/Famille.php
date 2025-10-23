<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Famille extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'libelle'];

    public function composants()
    {
        return $this->hasMany(Composant::class);
    }
}
