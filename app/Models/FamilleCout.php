<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilleCout extends Model
{
    use HasFactory;

    protected $primaryKey = 'code_famille';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_famille',
        'nom_famille',
        'cout_preparation',
        'type_support',
    ];

    public function calculCouts()
    {
        return $this->hasMany(CalculCout::class, 'code_famille', 'code_famille');
    }
}
