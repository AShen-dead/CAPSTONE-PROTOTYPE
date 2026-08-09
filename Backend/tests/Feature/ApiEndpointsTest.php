<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_benefit_types_index_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/benefit-types');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    public function test_benefit_types_store_endpoint_creates_resource(): void
    {
        $response = $this->postJson('/api/benefit-types', [
            'benefit_name' => 'Medical Assistance',
            'description' => 'Coverage for medical needs',
            'maximum_amount' => 5000.00,
            'status' => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.benefit_name', 'Medical Assistance');
    }
}
