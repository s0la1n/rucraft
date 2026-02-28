<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seed extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'title', 
        'seed_number', 
        'version',
        'minecraft_release',
        'coordinates', 
        'image', 
        'description', 
        'status',
    ];

    protected $casts = [
        'coordinates' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(SeedImage::class);
    }
}

