<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'title', 
        'description', 
        'image', 
        'mod_file',
        'version', 
        'minecraft_version', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ModeImage::class);
    }
}
