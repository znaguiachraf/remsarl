<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('primary_color', 7)->default('#3B82F6');
            $table->string('secondary_color', 7)->default('#10B981');
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->text('description')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('status', 20)->default('active');
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->json('config')->nullable(); // Extra project-specific config
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
