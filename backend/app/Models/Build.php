<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Build extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'title', 
        'minecraft_version',
        'image', 
        'build_file', 
        'description',
        'difficulty', 
        'materials', 
        'status',
    ];

    protected $casts = [
        'materials' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(BuildImage::class);
    }
}
