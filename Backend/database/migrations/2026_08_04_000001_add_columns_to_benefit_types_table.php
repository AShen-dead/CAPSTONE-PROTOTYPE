<?php

use Illuminate\Database\Migrations\Migration;

/**
 * This migration is now a no-op.
 * All benefit_types columns were moved into the original
 * create_benefit_types_table migration (2026_07_15_153806).
 */
return new class extends Migration
{
    public function up(): void
    {
        // No-op: columns already exist from the base migration.
    }

    public function down(): void
    {
        // No-op.
    }
};
