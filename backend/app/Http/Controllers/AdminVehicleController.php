<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminVehicleController extends Controller
{
    public function pendingVehicles(Request $request)
    {
        $vehicles = Vehicle::where('status', 'pending')
            ->with(['images', 'user'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }


    public function makeOffer(Request $request, $id)
     {
      $vehicle = Vehicle::find($id);

        if (! $vehicle) {
          return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
          ], 404);
        }

        if ($vehicle->status !== 'pending') {
          return response()->json([
            'success' => false,
            'message' => 'This vehicle is not awaiting an offer',
         ], 422);
        }

        $validator = Validator::make($request->all(), [
           'offer_amount' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
          return response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
           ], 422);
        }

    $vehicle->offer_amount = $request->offer_amount;
    $vehicle->status = 'offer_made';
    $vehicle->save();

    return response()->json([
        'success' => true,
        'message' => 'Offer sent successfully',
        'vehicle' => $vehicle,
    ]);
   }


   public function transfersQueue(Request $request)
    {
       $vehicles = Vehicle::where('status', 'transfer_submitted')
          ->with(['images', 'user'])
          ->orderBy('created_at', 'asc')
          ->get();

       return response()->json([
         'success' => true,
         'vehicles' => $vehicles,
        ]);
    }


    public function verifyTransfer(Request $request, $id)
    {
       $vehicle = Vehicle::find($id);

         if (! $vehicle) {
           return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
            ], 404);
        }

      if ($vehicle->status !== 'transfer_submitted') {
          return response()->json([
             'success' => false,
             'message' => 'This vehicle has no transfer proof awaiting verification',
            ], 422);
        }

      $vehicle->status = 'transfer_verified';
      $vehicle->transfer_verified_at = now();
      $vehicle->save();

     return response()->json([
        'success' => true,
        'message' => 'Transfer verified successfully',
        'vehicle' => $vehicle,
       ]);
    }


    public function markCompleted(Request $request, $id)
     {
       $vehicle = Vehicle::find($id);

       if (! $vehicle) {
           return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
           ], 404);
        }

       if ($vehicle->status !== 'transfer_verified') {
          return response()->json([
            'success' => false,
            'message' => 'This vehicle transfer has not been verified yet',
         ], 422);
        }

      $vehicle->status = 'completed';
      $vehicle->completed_at = now();
      $vehicle->save();
  
      return response()->json([
        'success' => true,
        'message' => 'Deal marked as completed',
        'vehicle' => $vehicle,
       ]);
    }

    public function rejectTransferDocument(Request $request, $id)
     {
        $vehicle = Vehicle::find($id);

      if (! $vehicle) {
         return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
          ], 404);
        }

      if ($vehicle->status !== 'transfer_submitted') {
          return response()->json([
            'success' => false,
            'message' => 'This vehicle has no transfer proof to reject',
          ], 422);
        }

      $validator = Validator::make($request->all(), [
        'reason' => 'nullable|string|max:255',
         ]);

      if ($validator->fails()) {
          return response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
          ], 422);
        }

      $vehicle->transfer_proof_path = null;
      $vehicle->transfer_rejection_reason = $request->reason;
      $vehicle->status = 'accepted'; // bounce back so seller can re-upload
      $vehicle->save();

      return response()->json([
         'success' => true,
         'message' => 'Transfer document rejected',
         'vehicle' => $vehicle,
     ]);
    }

    
}