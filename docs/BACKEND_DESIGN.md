# Laravel Backend Design — Modular ERP Application

## 1. Database Schema

### Core Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| email_verified_at | timestamp nullable | |
| password | string | |
| remember_token | string nullable | |
| timestamps | | |

#### `roles`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string unique | owner, admin, manager, member, viewer |
| description | string nullable | |
| level | integer default 0 | Higher = more privileges |
| timestamps | | |

#### `permissions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string unique | projects.view, pos.access, etc. |
| module | string nullable | Module key for grouping |
| description | string nullable | |
| timestamps | | |

#### `role_permission` (pivot)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| role_id | FK → roles | |
| permission_id | FK → permissions | |
| timestamps | | |
| UNIQUE(role_id, permission_id) | | |

#### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string unique | |
| logo | string nullable | Storage path |
| primary_color | string(7) default #3B82F6 | |
| secondary_color | string(7) default #10B981 | |
| address | text nullable | |
| phone | string nullable | |
| description | text nullable | |
| city | string nullable | |
| country | string nullable | |
| status | enum: active, suspended, archived | |
| owner_id | FK → users | |
| config | json nullable | Extra config |
| timestamps | | |
| soft_deletes | | |

#### `project_user` (pivot)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| project_id | FK → projects | |
| user_id | FK → users | |
| role_id | FK → roles | |
| status | enum: active, inactive, pending | |
| invited_at | timestamp nullable | |
| joined_at | timestamp nullable | |
| timestamps | | |
| UNIQUE(project_id, user_id) | | |

#### `modules`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| key | string unique | pos, tasks, payments, etc. |
| name | string | |
| description | string nullable | |
| icon | string nullable | |
| sort_order | integer default 0 | |
| is_active | boolean default true | |
| timestamps | | |

#### `project_modules`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| project_id | FK → projects | |
| module_key | string | References modules.key |
| config | json nullable | Module-specific settings |
| is_enabled | boolean default true | |
| timestamps | | |
| UNIQUE(project_id, module_key) | | |

#### `activity_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| project_id | FK → projects | |
| user_id | FK → users nullable | |
| action | string | created, updated, deleted |
| loggable_type | string | Polymorphic |
| loggable_id | bigint nullable | |
| old_values | json nullable | |
| new_values | json nullable | |
| ip_address | string(45) nullable | |
| user_agent | text nullable | |
| module | string nullable | Module key |
| description | text nullable | |
| timestamps | | |

### Module Tables (all have `project_id`)

- **products** — name, price, supplier_id, etc.
- **suppliers** — name, contact_person, email, phone, address
- **stock_movements** — product_id, type, quantity, reference
- **orders** — order_number, status, supplier_id, total
- **sales** — sale_number, status, total, source
- **expenses** — category, description, amount, expense_date
- **payments** — sale_id, payment_method, amount (created automatically when sales are completed)
- **tasks** — title, description, status, assignee_id, due_date
- **pos_sessions** — user_id, opening_cash, status
- **pos_transactions** — pos_session_id, sale_id, amount

---

## 2. Key Relationships

```
User ──┬── belongsToMany ──► Project (via project_user)
       └── hasMany ──► ProjectUser

Project ──┬── belongsTo ──► User (owner)
          ├── belongsToMany ──► User (via project_user, with role_id)
          ├── hasMany ──► ProjectUser
          ├── belongsToMany ──► Module (via project_modules, where is_enabled)
          ├── hasMany ──► ProjectModule
          └── hasMany ──► ActivityLog

ProjectUser (Pivot) ──┬── belongsTo ──► Project
                      ├── belongsTo ──► User
                      └── belongsTo ──► Role

Role ──┬── belongsToMany ──► Permission (via role_permission)
       └── hasMany ──► ProjectUser

Module ──┬── belongsToMany ──► Project (via project_modules)
         └── hasMany ──► ProjectModule

ProjectModule ──┬── belongsTo ──► Project
                └── belongsTo ──► Module (module_key → key)
```

---

## 3. Example Model Code

### Project Model

```php
class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'logo', 'primary_color', 'secondary_color',
        'address', 'phone', 'description', 'city', 'country',
        'status', 'owner_id', 'config',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'config' => 'array',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot(['role_id', 'status', 'invited_at', 'joined_at'])
            ->withTimestamps()
            ->using(ProjectUser::class);
    }

    public function enabledModules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'project_modules', 'project_id', 'module_key', 'id', 'key')
            ->withPivot(['config', 'is_enabled'])
            ->wherePivot('is_enabled', true);
    }

    public function projectModules(): HasMany
    {
        return $this->hasMany(ProjectModule::class);
    }

    public function hasModule(string $moduleKey): bool
    {
        return $this->projectModules()
            ->where('module_key', $moduleKey)
            ->where('is_enabled', true)
            ->exists();
    }
}
```

### Module Model

```php
class Module extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'name', 'description', 'icon', 'sort_order', 'is_active'];

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_modules', 'module_key', 'project_id', 'key', 'id')
            ->withPivot(['config', 'is_enabled'])
            ->withTimestamps();
    }

    public function isEnabledForProject(Project|int $project): bool
    {
        $projectId = $project instanceof Project ? $project->id : $project;
        return ProjectModule::where('project_id', $projectId)
            ->where('module_key', $this->key)
            ->where('is_enabled', true)
            ->exists();
    }

    public static function availableKeys(): array
    {
        return ['pos', 'tasks', 'payments', 'orders', 'products', 'stock', 'sales', 'expenses', 'suppliers', 'logs'];
    }
}
```

### ProjectModule Model

```php
class ProjectModule extends Model
{
    protected $fillable = ['project_id', 'module_key', 'config', 'is_enabled'];

    protected $casts = [
        'config' => 'array',
        'is_enabled' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_key', 'key');
    }

    public function getConfig(string $key, mixed $default = null): mixed
    {
        return data_get($this->config, $key, $default);
    }
}
```

---

## 4. Authorization (Policies)

- **ProjectPolicy** — view, create, update, delete, manageMembers, manageModules
- **ProjectModulePolicy** — view (check module enabled), manage

Use in controllers:

```php
$this->authorize('view', $project);
$this->authorize('manageMembers', $project);
```

---

## 5. Middleware

**EnsureProjectModuleEnabled** — Apply to module routes:

```php
Route::middleware(['auth', 'project.module:pos'])->group(function () {
    // POS routes
});
```

---

## 6. Service Classes

- **ProjectService** — create, update, assignUser, removeUser, enableModule, disableModule
- **ModuleService** — getAvailableModules, isModuleEnabled, ensureModuleEnabled

---

## 7. Enums

- **ProjectStatus** — active, suspended, archived
- **UserProjectStatus** — active, inactive, pending
