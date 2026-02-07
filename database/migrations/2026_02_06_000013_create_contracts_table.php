<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // cdi, cdd, freelance
            $table->string('status')->default('draft'); // draft, active, terminated, expired
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('salary_amount', 12, 2);
            $table->string('salary_currency', 3)->default('MAD');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
