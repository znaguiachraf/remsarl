<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('payments', 'sale_id')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreignId('sale_id')->nullable()->after('project_id')->constrained()->cascadeOnDelete();
            });
        }

        // Migrate existing sale payments
        $saleClass = \App\Models\Sale::class;
        DB::table('payments')
            ->where('payable_type', $saleClass)
            ->update(['sale_id' => DB::raw('payable_id')]);

        // Remove payments not linked to sales (expenses, orders)
        DB::table('payments')->whereNull('sale_id')->delete();

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payable_type', 'payable_id']);
            $table->index(['project_id', 'sale_id']);
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->dropIndex(['project_id', 'sale_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('payable_type')->after('project_id');
            $table->unsignedBigInteger('payable_id')->after('payable_type');
            $table->index(['project_id', 'payable_type', 'payable_id']);
        });

        DB::table('payments')->update([
            'payable_type' => \App\Models\Sale::class,
            'payable_id' => DB::raw('sale_id'),
        ]);

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('sale_id');
        });
    }
};
