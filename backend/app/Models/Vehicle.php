<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'make',
        'model',
        'year',
        'registration_number',
        'condition_notes',
        'description',
        'desired_price_min',
        'desired_price_max',
        'national_id',
        'logbook_path',
        'offer_amount',
        'status',
        'transfer_proof_path',
        'transfer_seller_name',
        'transfer_seller_email',
        'transfer_rejection_reason',
        'transfer_verified_at',
        'completed_at',
    ];

    protected $casts = [
        'transfer_verified_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // A vehicle belongs to one seller.
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A vehicle has many photos
    public function images()
    {
        return $this->hasMany(VehicleImage::class);
    }
}