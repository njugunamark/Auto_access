<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Middleware\IsAdmin;
use App\Http\Controllers\AdminVehicleController;

//public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


//private routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/vehicles', [VehicleController::class, 'myVehicles']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'singleVehicle']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'deleteVehicle']);
    Route::post('/vehicles/{id}/accept', [VehicleController::class, 'acceptOffer']);
    Route::post('/vehicles/{id}/reject', [VehicleController::class, 'rejectOffer']);
    Route::post('/vehicles/{id}/transfer-proof', [VehicleController::class, 'submitTransferProof']);
    });

    //admin routes
Route::middleware(['auth:sanctum', IsAdmin::class])->prefix('admin')->group(function () {
    Route::get('/vehicles/pending', [AdminVehicleController::class, 'pendingVehicles']);
    Route::post('/vehicles/{id}/offer', [AdminVehicleController::class, 'makeOffer']);
    Route::get('/vehicles/transfers', [AdminVehicleController::class, 'transfersQueue']);
    Route::post('/vehicles/{id}/verify-transfer', [AdminVehicleController::class, 'verifyTransfer']);
    Route::post('/vehicles/{id}/complete', [AdminVehicleController::class, 'markCompleted']);
    Route::post('/vehicles/{id}/reject-transfer', [AdminVehicleController::class, 'rejectTransferDocument']);
    Route::post('/vehicles/{id}/decline', [AdminVehicleController::class, 'declineVehicle']);
});