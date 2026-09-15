<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Vehicle details
            $table->string('make');
            $table->string('model');
            $table->string('year');
            $table->string('registration_number');
            $table->text('condition_notes')->nullable();
            $table->text('description')->nullable();

            // Desired price range
            $table->unsignedInteger('desired_price_min');
            $table->unsignedInteger('desired_price_max');

            // Ownership proof
            $table->string('national_id');
            $table->string('logbook_path')->nullable();

            // Offer + status
            $table->unsignedInteger('offer_amount')->nullable();
            $table->enum('status', [
                'pending',
                'offer_made',
                'accepted',
                'rejected',
                'transfer_submitted',
                'transfer_verified',
                'completed',
            ])->default('pending');

            // Transfer proof
            $table->string('transfer_proof_path')->nullable();
            $table->string('transfer_seller_name')->nullable();
            $table->string('transfer_seller_email')->nullable();
            $table->string('transfer_rejection_reason')->nullable();
            $table->timestamp('transfer_verified_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};