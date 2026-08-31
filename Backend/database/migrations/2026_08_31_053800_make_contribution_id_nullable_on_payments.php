<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Makes contribution_id nullable on the payments table.
 *
 * SQLite does not support ALTER COLUMN, so we recreate the table.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');

        // 1. Create new table with contribution_id nullable
        DB::statement('
            CREATE TABLE payments_new (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                faculty_id       INTEGER NOT NULL,
                contribution_id  INTEGER NULL,
                payment_date     DATE    NOT NULL,
                amount           DECIMAL(10,2) NOT NULL,
                payment_method   VARCHAR(255) NULL,
                reference_no     VARCHAR(255) NULL,
                status           VARCHAR(255) NOT NULL DEFAULT \'Pending\',
                recorded_by      INTEGER NULL
            )
        ');

        // 2. Copy existing rows
        DB::statement('INSERT INTO payments_new SELECT * FROM payments');

        // 3. Swap tables
        DB::statement('DROP TABLE payments');
        DB::statement('ALTER TABLE payments_new RENAME TO payments');

        DB::statement('PRAGMA foreign_keys=ON');
    }

    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');

        DB::statement('
            CREATE TABLE payments_new (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                faculty_id       INTEGER NOT NULL REFERENCES faculty_members(id) ON DELETE CASCADE,
                contribution_id  INTEGER NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
                payment_date     DATE    NOT NULL,
                amount           DECIMAL(10,2) NOT NULL,
                payment_method   VARCHAR(255) NULL,
                reference_no     VARCHAR(255) NULL,
                status           VARCHAR(255) NOT NULL DEFAULT \'Pending\',
                recorded_by      INTEGER NULL REFERENCES users(id)
            )
        ');

        DB::statement('INSERT INTO payments_new SELECT * FROM payments WHERE contribution_id IS NOT NULL');
        DB::statement('DROP TABLE payments');
        DB::statement('ALTER TABLE payments_new RENAME TO payments');

        DB::statement('PRAGMA foreign_keys=ON');
    }
};
