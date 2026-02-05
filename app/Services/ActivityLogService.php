<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Project;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    public function log(
        Project $project,
        string $action,
        Model $loggable,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $module = null,
        ?string $description = null
    ): ActivityLog {
        return ActivityLog::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'action' => $action,
            'loggable_type' => $loggable->getMorphClass(),
            'loggable_id' => $loggable->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'module' => $module,
            'description' => $description,
        ]);
    }
}
