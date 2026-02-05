<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('expense_category_id')->nullable()->after('project_id')->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->after('expense_category_id')->constrained()->nullOnDelete();
            $table->string('status')->default('pending')->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['expense_category_id']);
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['expense_category_id', 'supplier_id', 'status']);
        });
    }
};
