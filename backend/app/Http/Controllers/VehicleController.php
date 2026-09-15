<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'make' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|string|max:4',
            'registration_number' => 'required|string|max:20',
            'condition_notes' => 'nullable|string',
            'description' => 'nullable|string',
            'desired_price_min' => 'required|integer|min:0',
            'desired_price_max' => 'required|integer|min:0',
            'national_id' => 'required|string|max:20',
            'logbook' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'photos' => 'required|array|min:4',
            'photos.*' => 'file|mimes:jpg,jpeg,png|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Save the logbook file
        $logbookPath = $request->file('logbook')->store('logbooks', 'public');

        // Create the vehicle record
        $vehicle = Vehicle::create([
            'user_id' => $request->user()->id,
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
            'registration_number' => $request->registration_number,
            'condition_notes' => $request->condition_notes,
            'description' => $request->description,
            'desired_price_min' => $request->desired_price_min,
            'desired_price_max' => $request->desired_price_max,
            'national_id' => $request->national_id,
            'logbook_path' => $logbookPath,
            'status' => 'pending',
        ]);

        // Save each photo and link each to the vehicle
        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('vehicles', 'public');

            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle submitted successfully',
            'vehicle' => $vehicle->load('images'),
        ], 201);
    }


    public function myVehicles(Request $request)
    {
      $vehicles = Vehicle::where('user_id', $request->user()->id)
         ->with('images')
         ->orderBy('created_at', 'desc')
         ->get();

      return response()->json([
         'success' => true,
         'vehicles' => $vehicles,
      ]);
   }


    public function singleVehicle(Request $request, $id)
     {
        $vehicle = Vehicle::with('images')->find($id);

           if (! $vehicle) {
              return response()->json([
                  'success' => false,
                  'message' => 'Vehicle not found',
            ], 404);
           }

        // A seller can only view their own vehicle; an admin can view any
           if ($request->user()->role !== 'admin' && $vehicle->user_id !== $request->user()->id) {
               return response()->json([
                   'success' => false,
                   'message' => 'Unauthorized',
            ], 403);
           }

        return response()->json([
            'success' => true,
             'vehicle' => $vehicle,
        ]);
 }

    public function deleteVehicle(Request $request, $id)
   {
       $vehicle = Vehicle::find($id);

         if (! $vehicle) {
            return response()->json([
                  'success' => false,
                  'message' => 'Vehicle not found',
          ], 404);
        }

        if ($vehicle->user_id !== $request->user()->id) {
             return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
         ], 403);
        }

    $vehicle->delete();

      return response()->json([
           'success' => true,
            'message' => 'Vehicle deleted successfully',
     ]);
    }

    
  public function acceptOffer(Request $request, $id)
   {
        $vehicle = Vehicle::find($id);

          if (! $vehicle) {
           return response()->json([
               'success' => false,
                'message' => 'Vehicle not found',
            ], 404);
        }

       if ($vehicle->user_id !== $request->user()->id) {
           return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
          ], 403);
        }

       if ($vehicle->status !== 'offer_made') {
           return response()->json([
             'success' => false,
            'message' => 'This vehicle has no pending offer to accept',
         ], 422);
       }

      $vehicle->status = 'accepted';
      $vehicle->save();

       return response()->json([
        'success' => true,
        'message' => 'Offer accepted',
        'vehicle' => $vehicle,
      ]);
    }

    public function rejectOffer(Request $request, $id)
      {
        $vehicle = Vehicle::find($id);

         if (! $vehicle) {
            return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
        ], 404);
       }

      if ($vehicle->user_id !== $request->user()->id) {
         return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
         ], 403);
        } 

       if ($vehicle->status !== 'offer_made') {
          return response()->json([
            'success' => false,
            'message' => 'This vehicle has no pending offer to reject',
         ], 422);
        }

       $vehicle->status = 'rejected';
       $vehicle->save();

        return response()->json([
           'success' => true,
           'message' => 'Offer rejected',
           'vehicle' => $vehicle,
        ]);
    }


    public function submitTransferProof(Request $request, $id)
  {
    $vehicle = Vehicle::find($id);

    if (! $vehicle) {
        return response()->json([
            'success' => false,
            'message' => 'Vehicle not found',
        ], 404);
    }

    if ($vehicle->user_id !== $request->user()->id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 403);
    }

    if ($vehicle->status !== 'accepted') {
        return response()->json([
            'success' => false,
            'message' => 'This vehicle is not ready for transfer proof submission',
        ], 422);
    }

    $validator = Validator::make($request->all(), [
        'seller_name' => 'required|string|max:255',
        'seller_email' => 'required|email|max:255',
        'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
    ]);

     if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
        ], 422);
    }

    $proofPath = $request->file('proof')->store('transfer-proofs', 'public');

    $vehicle->transfer_proof_path = $proofPath;
    $vehicle->transfer_seller_name = $request->seller_name;
    $vehicle->transfer_seller_email = $request->seller_email;
    $vehicle->status = 'transfer_submitted';
    $vehicle->save();
 
      return response()->json([
        'success' => true,
        'message' => 'Transfer proof submitted successfully',
        'vehicle' => $vehicle,
     ]);
    }



}