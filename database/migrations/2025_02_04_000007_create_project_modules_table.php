<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('module_key'); // References modules.key
            $table->json('config')->nullable(); // Module-specific configuration per project
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['project_id', 'module_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_modules');
    }
};
