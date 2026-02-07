<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            $table->decimal('absent_days', 4, 1)->default(0)->after('net_amount');
            $table->decimal('attendance_deduction', 12, 2)->default(0)->after('absent_days');
        });
    }

    public function down(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            $table->dropColumn(['absent_days', 'attendance_deduction']);
        });
    }
};
