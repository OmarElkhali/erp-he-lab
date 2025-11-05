<?php
// app/Models/Sauvegarde.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sauvegarde extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'matrice_id',
        'nom_sauvegarde',
        'data',
        'current_step',
        'statut'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matrice()
    {
        return $this->belongsTo(Matrice::class);
    }
}