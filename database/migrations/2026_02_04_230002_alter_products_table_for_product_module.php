<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('product_category_id')->nullable()->after('project_id')
                ->constrained('product_categories')->nullOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sku');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_category_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('name');
        });
    }
};
