<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->boolean('include_tva')->default(false)->after('customer_email');
            $table->decimal('tva_rate', 5, 2)->nullable()->after('include_tva');
            $table->decimal('tva_amount', 12, 2)->default(0)->after('tva_rate');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['include_tva', 'tva_rate', 'tva_amount']);
        });
    }
};
