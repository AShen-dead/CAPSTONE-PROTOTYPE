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
        Schema::create('benefit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained('faculty_members')->cascadeOnDelete();
            $table->foreignId('benefit_type_id')->constrained('benefit_types');
            $table->date('request_date')->useCurrent();
            $table->decimal('amount_requested', 10, 2)->nullable();
            $table->text('reason')->nullable();
            $table->string('status')->default('Pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->datetime('approved_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('benefit_requests');
    }
};
