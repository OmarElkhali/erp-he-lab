<?php
// app/Models/Matrice.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matrice extends Model
{
    use HasFactory;

    protected $fillable = ['label', 'value', 'abreviation'];

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }
}