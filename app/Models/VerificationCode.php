<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class VerificationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Générer un code aléatoire à 6 chiffres
     */
    public static function generateCode()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Vérifier si le code est expiré
     */
    public function isExpired()
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Vérifier si le code est valide (non utilisé et non expiré)
     */
    public function isValid()
    {
        return !$this->is_used && !$this->isExpired();
    }
}
