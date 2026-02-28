<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModeImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'mode_id',
        'image_path',
        'sort_order',
    ];

    public function mode(): BelongsTo
    {
        return $this->belongsTo(Mode::class);
    }
}

