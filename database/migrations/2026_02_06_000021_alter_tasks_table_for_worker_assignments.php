<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tasks')->delete();

        if (Schema::hasColumn('tasks', 'assignee_id')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropForeign(['assignee_id']);
                $table->dropColumn('assignee_id');
            });
        }

        if (!Schema::hasColumn('tasks', 'worker_id')) {
            Schema::table('tasks', function (Blueprint $table) {
                if (Schema::hasColumn('tasks', 'priority')) {
                    $table->dropColumn('priority');
                }
                $table->foreignId('worker_id')->after('description')->constrained('workers')->cascadeOnDelete();
            });
        } else {
            if (Schema::hasColumn('tasks', 'priority')) {
                Schema::table('tasks', function (Blueprint $table) {
                    $table->dropColumn('priority');
                });
            }
            $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'worker_id' AND REFERENCED_TABLE_NAME IS NOT NULL", [DB::getDatabaseName()]);
            if (empty($fks)) {
                Schema::table('tasks', function (Blueprint $table) {
                    $table->foreign('worker_id')->references('id')->on('workers')->cascadeOnDelete();
                });
            }
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['worker_id']);
            $table->dropColumn('worker_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('priority', 20)->default('medium');
            $table->string('status', 30)->default('todo')->change();
        });
    }
};
