# Architecture Rules — Project-Scoped Multi-Tenancy

## Strict Rules (Enforced)

### 1. Project ID on Business Data
- **Every table** related to business data MUST include `project_id`
- Tables with `project_id`: projects, project_user, project_modules, activity_logs, suppliers, products, stock_movements, orders, sales, expenses, payments, tasks, pos_sessions, pos_transactions
- Global tables (no `project_id`): users, roles, permissions, role_permission, modules, password_reset_tokens, sessions

### 2. Never Mix Data Between Projects
- All queries for project-scoped models MUST be filtered by `project_id`
- Use `Model::forProject($project)` or `->where('project_id', $project->id)` on every query
- Validate that related resources (e.g. workers, products) belong to the current project before acting on them

### 3. Query Scoping
- **Always** scope by project when querying: `Product::forProject($project)->get()`
- **Never** use `Product::all()` for business data — it would mix projects
- Use the `BelongsToProject` trait's `scopeForProject()` on all project-scoped models

### 4. Authorization (Both Required)
1. **User belongs to project**: `$user->hasProjectAccess($project)`
2. **User role allows action**: `$user->roleOnProject($project)?->hasPermission('action')`
- Policies must check both; middleware `project.access` enforces #1 on all `{project}` routes

### 5. Modules Toggleable
- Module access is checked via `EnsureProjectModuleEnabled` middleware
- If module is disabled → 403 (no breaking; route simply denies access)
- Module data (e.g. products, tasks) remains in DB when module is disabled; UI hides it
- Never assume a module is enabled — always check `$project->hasModule($key)` before module-specific logic

### 6. No Hard-Coded Project IDs
- Never use `where('project_id', 1)` or similar
- Always pass `$project` from route/request and use `$project->id`

### 7. Production-Ready Code
- Use type hints, return types, and docblocks
- Validate all inputs; authorize all actions
- Use transactions for multi-step operations

---

## Implementation Checklist

- [ ] Model uses `BelongsToProject` trait
- [ ] Model has `project_id` in `$fillable`
- [ ] All queries use `forProject($project)` or explicit `where('project_id', ...)`
- [ ] Controller receives `Project $project` from route
- [ ] Policy checks `hasProjectAccess` + role permission
- [ ] No hard-coded IDs
