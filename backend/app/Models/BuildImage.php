<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuildImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'build_id',
        'image_path',
        'sort_order',
    ];

    public function build(): BelongsTo
    {
        return $this->belongsTo(Build::class);
    }
}

