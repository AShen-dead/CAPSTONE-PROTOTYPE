<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BenefitRequestController;
use App\Http\Controllers\Api\BenefitTypeController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\FacultyMemberController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

// =====================================================
// PUBLIC — Authentication (no token required)
// =====================================================

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// =====================================================
// PROTECTED — All routes below require a Sanctum token
// Send: Authorization: Bearer <token>
// =====================================================

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    // Faculty Members
    Route::apiResource('faculty-members', FacultyMemberController::class);

    // Benefit Types
    Route::apiResource('benefit-types', BenefitTypeController::class);

    // Contributions
    Route::apiResource('contributions', ContributionController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class);

    // Benefit Requests + custom approve action
    Route::patch('benefit-requests/{benefit_request}/approve', [BenefitRequestController::class, 'approve']);
    Route::apiResource('benefit-requests', BenefitRequestController::class);
});