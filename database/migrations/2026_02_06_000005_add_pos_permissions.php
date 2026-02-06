<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'Open POS Session', 'slug' => 'pos.open_session', 'module' => 'pos'],
            ['name' => 'Close POS Session', 'slug' => 'pos.close_session', 'module' => 'pos'],
            ['name' => 'Create POS Order', 'slug' => 'pos.create_order', 'module' => 'pos'],
            ['name' => 'Pay POS Order', 'slug' => 'pos.pay_order', 'module' => 'pos'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => $perm['slug']],
                array_merge($perm, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        $newPermIds = DB::table('permissions')
            ->whereIn('slug', ['pos.open_session', 'pos.close_session', 'pos.create_order', 'pos.pay_order'])
            ->pluck('id');

        $rolesWithPos = ['owner', 'admin', 'manager', 'member'];
        foreach ($rolesWithPos as $slug) {
            $role = DB::table('roles')->where('slug', $slug)->first();
            if ($role) {
                foreach ($newPermIds as $pid) {
                    $exists = DB::table('role_permission')
                        ->where('role_id', $role->id)
                        ->where('permission_id', $pid)
                        ->exists();
                    if (!$exists) {
                        DB::table('role_permission')->insert([
                            'role_id' => $role->id,
                            'permission_id' => $pid,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->whereIn('slug', [
            'pos.open_session', 'pos.close_session', 'pos.create_order', 'pos.pay_order',
        ])->pluck('id');

        DB::table('role_permission')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();
    }
};
