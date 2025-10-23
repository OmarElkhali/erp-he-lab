<?php
// app/Models/Ville.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ville extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'frais_deplacement'];

    public function sites()
    {
        return $this->hasMany(Site::class);
    }
}