<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuildModerationRequest extends Model
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
        'admin_comment',
        'reviewed_by',
    ];

    protected $casts = [
        'materials' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
