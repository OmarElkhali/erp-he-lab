<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cout extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'libelle', 'type', 'valeur', 'regle_calcul'];
}
