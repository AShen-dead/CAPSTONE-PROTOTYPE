<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BenefitRequestController;
use App\Http\Controllers\Api\BenefitTypeController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FacultyMemberController;
use App\Http\Controllers\Api\FacultyPaymentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NotifyController;
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

    // Dashboard stats
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Faculty self-service: submit their own payment proof
    Route::post('faculty/submit-payment', [FacultyPaymentController::class, 'store']);

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

    // Generic notify (faculty → admins, admin → specific user)
    Route::post('notify', [NotifyController::class, 'send']);

    // Notifications
    Route::get('notifications',                          [NotificationController::class, 'index']);
    Route::patch('notifications/read-all',               [NotificationController::class, 'markAllRead']);
    Route::patch('notifications/{id}/read',              [NotificationController::class, 'markRead']);
    Route::delete('notifications/{id}',                  [NotificationController::class, 'destroy']);
});