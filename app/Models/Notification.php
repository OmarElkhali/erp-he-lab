<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'data',
        'is_read',
        'is_accepted'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'is_accepted' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}