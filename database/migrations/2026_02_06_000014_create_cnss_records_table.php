<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cnss_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
            $table->string('registration_number');
            $table->date('registration_date')->nullable();
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cnss_records');
    }
};
