<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default admin account for testing the API
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@ucare.local',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Default faculty account for testing
        User::create([
            'name'     => 'Faculty Test',
            'email'    => 'faculty@ucare.local',
            'password' => Hash::make('password'),
            'role'     => 'faculty',
        ]);
    }
}
