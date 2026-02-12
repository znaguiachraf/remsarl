<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->boolean('include_tva')->default(false)->after('source');
            $table->decimal('tva_rate', 5, 2)->default(20.00)->after('include_tva');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['include_tva', 'tva_rate']);
        });
    }
};
