<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class WorkerFactory extends Factory
{
    protected $model = Worker::class;

    public function definition(): array
    {
        $project = Project::factory();
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $email = $this->faker->optional(0.8)->safeEmail();

        $user = User::factory()->create([
            'name' => "{$firstName} {$lastName}",
            'email' => $email ?: 'worker_' . $this->faker->unique()->uuid() . '@internal.local',
            'password' => Hash::make('password'),
        ]);

        return [
            'project_id' => $project,
            'user_id' => $user->id,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $this->faker->optional()->phoneNumber(),
            'address' => null,
            'birth_date' => null,
            'hire_date' => null,
            'employee_number' => null,
            'cnss_number' => null,
        ];
    }
}
