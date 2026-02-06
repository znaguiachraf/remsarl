<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pos_order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method', 50); // cash, card, transfer, etc.
            $table->decimal('amount', 12, 2);
            $table->string('reference')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->index(['project_id', 'pos_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_payments');
    }
};
