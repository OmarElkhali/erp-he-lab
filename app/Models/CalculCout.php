<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculCout extends Model
{
    use HasFactory;

    protected $fillable = [
        'poste_id',
        'code_famille',
        'cout_c1',
        'cout_c2',
        'cout_c3',
        'sous_total',
    ];

    public function poste()
    {
        return $this->belongsTo(PosteTravail::class);
    }

    public function familleCout()
    {
        return $this->belongsTo(FamilleCout::class, 'code_famille', 'code_famille');
    }
}
