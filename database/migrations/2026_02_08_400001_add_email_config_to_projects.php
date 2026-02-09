<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('mail_from_name')->nullable()->after('config');
            $table->string('mail_from_address')->nullable()->after('mail_from_name');
            $table->string('smtp_driver', 30)->nullable()->after('mail_from_address');
            $table->string('smtp_host')->nullable()->after('smtp_driver');
            $table->unsignedSmallInteger('smtp_port')->nullable()->after('smtp_host');
            $table->string('smtp_username')->nullable()->after('smtp_port');
            $table->text('smtp_password')->nullable()->after('smtp_username'); // encrypted
            $table->string('smtp_encryption', 10)->nullable()->after('smtp_password');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'mail_from_name',
                'mail_from_address',
                'smtp_driver',
                'smtp_host',
                'smtp_port',
                'smtp_username',
                'smtp_password',
                'smtp_encryption',
            ]);
        });
    }
};
