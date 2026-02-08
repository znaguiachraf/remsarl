<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->string('direction', 20)->default('to_employee'); // to_employee, from_employee
            $table->timestamps();

            $table->index(['project_id', 'worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_notes');
    }
};
