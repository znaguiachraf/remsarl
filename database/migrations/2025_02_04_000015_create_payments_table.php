<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('payable_type'); // Order, Sale, Expense, etc.
            $table->unsignedBigInteger('payable_id');
            $table->string('payment_method'); // cash, card, transfer, etc.
            $table->decimal('amount', 12, 2);
            $table->string('reference')->nullable();
            $table->date('payment_date');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'payable_type', 'payable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
