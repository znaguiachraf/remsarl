# Frontend Structure — Inertia.js + React

## Folder Structure

```
resources/js/
├── app.jsx                    # Inertia entry point (lazy loads pages)
├── bootstrap.js
├── Components/
│   ├── ui/                    # Generic UI (from Breeze)
│   │   ├── ApplicationLogo.jsx
│   │   ├── PrimaryButton.jsx
│   │   ├── TextInput.jsx
│   │   └── ...
│   └── project/               # Project-aware components
│       ├── Sidebar.jsx        # Dynamic sidebar (enabled modules)
│       ├── Topbar.jsx         # Header with project switcher
│       ├── ProjectSwitcher.jsx
│       ├── ModuleCard.jsx     # Card for module in dashboard
│       └── StatusBadge.jsx    # Project/user status badges
├── Layouts/
│   ├── AuthenticatedLayout.jsx  # No project context (auth pages, selector)
│   ├── GuestLayout.jsx
│   └── ProjectLayout.jsx       # Project-aware layout (sidebar + topbar)
└── Pages/
    ├── Auth/
    ├── Projects/
    │   ├── Selector.jsx       # Project switcher / list
    │   ├── Create.jsx         # 4-step creation wizard
    │   ├── Dashboard.jsx      # Project dashboard
    │   ├── Workers/
    │   │   └── Index.jsx      # Workers management
    │   └── Roles/
    │       └── Index.jsx      # Role & permission management
    ├── Modules/
    │   ├── Placeholder.jsx    # Default module page (lazy-loaded)
    │   └── {module}/          # Per-module pages (pos/, tasks/, etc.)
    └── ModuleDisabled.jsx     # 403 fallback (module not enabled)
```

## Shared Props (Inertia)

Set in `HandleInertiaRequests` middleware:

| Prop | Description | When Available |
|------|-------------|----------------|
| `currentProject` | Active project (id, name, logo, colors, status) | On project-scoped routes |
| `enabledModules` | Array of enabled modules (key, name, icon) | When `currentProject` exists |
| `userRole` | User's role in current project (id, name, slug) | When on project |
| `userProjects` | User's accessible projects | When authenticated |

## Sidebar Logic (Dynamic Modules)

```jsx
// Sidebar.jsx — only shows enabled modules
{enabledModules?.map((module) => (
  <NavItem
    key={module.key}
    href={route('projects.modules.show', [projectId, module.key])}
    active={isActive(`/projects/${projectId}/modules/${module.key}`)}
    icon={module.icon}
  >
    {module.name}
  </NavItem>
))}
```

## Routes

| Route | Page | Layout |
|-------|------|--------|
| `/projects` | Selector | AuthenticatedLayout |
| `/projects/create` | Create (wizard) | AuthenticatedLayout |
| `/projects/{id}` | Dashboard | ProjectLayout |
| `/projects/{id}/workers` | Workers | ProjectLayout |
| `/projects/{id}/roles` | Roles | ProjectLayout |
| `/projects/{id}/modules/{module}` | Module page | ProjectLayout |

## Module Lazy Loading

Module pages are lazy-loaded via Vite's dynamic import:

```jsx
// In app.jsx, pages use:
resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'))
```

Add module-specific pages:

```
Pages/Modules/pos/Index.jsx
Pages/Modules/tasks/Index.jsx
```

Then update `ModuleController` to render the correct page per module key.

## Project Branding

CSS variables set in `ProjectLayout`:

```css
--project-primary: #3B82F6;
--project-secondary: #10B981;
```

Use in components: `style={{ color: 'var(--project-primary)' }}`

## Module Disabled (403)

When middleware `EnsureProjectModuleEnabled` fails → `abort(403)`.

To show Inertia page instead of default 403, add exception handler in `bootstrap/app.php` or `App\Exceptions\Handler`.
