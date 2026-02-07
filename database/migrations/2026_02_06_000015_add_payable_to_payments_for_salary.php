<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('payments', 'payable_type')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->string('payable_type')->nullable()->after('project_id');
                $table->unsignedBigInteger('payable_id')->nullable()->after('payable_type');
            });
        }

        // Migrate existing sale payments to polymorphic (sale_id stays for backward compat)
        DB::table('payments')
            ->whereNotNull('sale_id')
            ->whereNull('payable_type')
            ->update([
                'payable_type' => \App\Models\Sale::class,
                'payable_id' => DB::raw('sale_id'),
            ]);

        $indexName = 'payments_project_id_payable_type_payable_id_index';
        $indexExists = collect(DB::select("SHOW INDEX FROM payments WHERE Key_name = ?", [$indexName]))->isNotEmpty();
        if (!$indexExists) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['project_id', 'payable_type', 'payable_id']);
            });
        }
    }

    public function down(): void
    {
        $indexName = 'payments_project_id_payable_type_payable_id_index';
        $indexExists = collect(DB::select("SHOW INDEX FROM payments WHERE Key_name = ?", [$indexName]))->isNotEmpty();
        if ($indexExists) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropIndex(['project_id', 'payable_type', 'payable_id']);
            });
        }
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payable_type', 'payable_id']);
        });
    }
};
