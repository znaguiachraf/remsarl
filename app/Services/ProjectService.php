<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Enums\UserProjectStatus;
use App\Models\Project;
use App\Models\ProjectModule;
use App\Models\ProjectUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    /**
     * Create a new project with owner assigned.
     */
    public function create(array $data, User $owner): Project
    {
        return DB::transaction(function () use ($data, $owner) {
            $project = Project::create([
                'name' => $data['name'],
                'slug' => $data['slug'] ?? null,
                'logo' => $data['logo'] ?? null,
                'primary_color' => $data['primary_color'] ?? '#3B82F6',
                'secondary_color' => $data['secondary_color'] ?? '#10B981',
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'description' => $data['description'] ?? null,
                'city' => $data['city'] ?? null,
                'country' => $data['country'] ?? null,
                'status' => $data['status'] ?? ProjectStatus::Active,
                'owner_id' => $owner->id,
                'config' => $data['config'] ?? null,
            ]);

            $ownerRole = Role::where('slug', 'owner')->first();
            if ($ownerRole) {
                $project->users()->attach($owner->id, [
                    'role_id' => $ownerRole->id,
                    'status' => UserProjectStatus::Active,
                    'joined_at' => now(),
                ]);
            }

            return $project;
        });
    }

    /**
     * Update project.
     */
    public function update(Project $project, array $data): Project
    {
        $project->update($data);

        return $project->fresh();
    }

    /**
     * Assign user to project with role.
     */
    public function assignUser(Project $project, User $user, Role $role, ?UserProjectStatus $status = null): ProjectUser
    {
        $status = $status ?? UserProjectStatus::Active;
        $pivotData = [
            'role_id' => $role->id,
            'status' => $status,
            'invited_at' => now(),
        ];
        if ($status === UserProjectStatus::Active) {
            $pivotData['joined_at'] = now();
        }

        $project->users()->syncWithoutDetaching([
            $user->id => $pivotData,
        ]);

        return $project->users()->where('user_id', $user->id)->first()->pivot;
    }

    /**
     * Remove user from project.
     */
    public function removeUser(Project $project, User $user): bool
    {
        return $project->users()->detach($user->id) > 0;
    }

    /**
     * Update user role in project.
     */
    public function updateUserRole(Project $project, User $user, Role $role): void
    {
        $project->users()->updateExistingPivot($user->id, ['role_id' => $role->id]);
    }

    /**
     * Enable module for project.
     */
    public function enableModule(Project $project, string $moduleKey, ?array $config = null): ProjectModule
    {
        return ProjectModule::updateOrCreate(
            [
                'project_id' => $project->id,
                'module_key' => $moduleKey,
            ],
            [
                'config' => $config ?? [],
                'is_enabled' => true,
            ]
        );
    }

    /**
     * Disable module for project.
     */
    public function disableModule(Project $project, string $moduleKey): bool
    {
        return ProjectModule::where('project_id', $project->id)
            ->where('module_key', $moduleKey)
            ->update(['is_enabled' => false]) > 0;
    }

    /**
     * Set enabled modules for project (replaces current list).
     */
    public function setEnabledModules(Project $project, array $moduleKeys): void
    {
        DB::transaction(function () use ($project, $moduleKeys) {
            ProjectModule::where('project_id', $project->id)->update(['is_enabled' => false]);

            foreach ($moduleKeys as $key) {
                $this->enableModule($project, $key);
            }
        });
    }
}
