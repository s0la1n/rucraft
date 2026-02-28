<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeedImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'seed_id',
        'image_path',
        'sort_order',
    ];

    public function seed(): BelongsTo
    {
        return $this->belongsTo(Seed::class);
    }
}

