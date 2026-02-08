<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('invoice_number');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status', 30)->default('draft'); // draft, sent, partial, paid, cancelled
            $table->string('customer_email')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'invoice_number']);
            $table->index(['project_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
