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
        Schema::table('announcements', function (Blueprint $table) {
            $table->boolean('is_contribution_drive')->default(false);
            $table->string('benefit_type')->nullable();
            $table->string('beneficiary_name')->nullable();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('announcement_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['is_contribution_drive', 'benefit_type', 'beneficiary_name']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('announcement_id');
        });
    }
};
