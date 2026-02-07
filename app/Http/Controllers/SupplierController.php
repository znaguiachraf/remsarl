<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Supplier::class, $project]);

        $query = Supplier::forProject($project)
            ->withCount(['products', 'expenses'])
            ->orderBy('name');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->paginate($request->get('per_page', 15))->withQueryString();
        $user = $request->user();

        return Inertia::render('Suppliers/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'suppliers' => [
                'data' => $suppliers->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'contact_person' => $s->contact_person,
                    'email' => $s->email,
                    'phone' => $s->phone,
                    'is_active' => $s->is_active,
                    'products_count' => $s->products_count,
                    'expenses_count' => $s->expenses_count,
                    'can_update' => $user->can('update', $s),
                    'can_delete' => $user->can('delete', $s),
                ]),
                'links' => $suppliers->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $suppliers->currentPage(),
                    'last_page' => $suppliers->lastPage(),
                    'per_page' => $suppliers->perPage(),
                    'total' => $suppliers->total(),
                ],
            ],
            'filters' => [
                'search' => $request->get('search'),
                'is_active' => $request->get('is_active'),
            ],
            'can' => [
                'create' => $user->can('create', [Supplier::class, $project]),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Supplier::class, $project]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        Supplier::create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Supplier created.');
    }

    public function show(Project $project, Supplier $supplier): Response
    {
        $this->authorize('view', $supplier);
        $this->ensureSupplierBelongsToProject($project, $supplier);

        $supplier->load(['products' => fn ($q) => $q->orderBy('name'), 'expenses' => fn ($q) => $q->orderByDesc('expense_date')->limit(20)]);
        $user = request()->user();

        return Inertia::render('Suppliers/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'email' => $supplier->email,
                'phone' => $supplier->phone,
                'address' => $supplier->address,
                'notes' => $supplier->notes,
                'is_active' => $supplier->is_active,
                'products' => $supplier->products->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => (float) $p->price,
                    'unit' => $p->unit,
                    'is_active' => $p->is_active,
                ]),
                'expenses' => $supplier->expenses->map(fn ($e) => [
                    'id' => $e->id,
                    'reference' => $e->reference,
                    'description' => $e->description,
                    'amount' => (float) $e->amount,
                    'status' => $e->status->value,
                    'expense_date' => $e->expense_date->format('Y-m-d'),
                ]),
            ],
            'can' => [
                'update' => $user->can('update', $supplier),
                'delete' => $user->can('delete', $supplier),
            ],
        ]);
    }

    public function update(Request $request, Project $project, Supplier $supplier)
    {
        $this->authorize('update', $supplier);
        $this->ensureSupplierBelongsToProject($project, $supplier);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $supplier->update([
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Supplier updated.');
    }

    public function destroy(Project $project, Supplier $supplier)
    {
        $this->authorize('delete', $supplier);
        $this->ensureSupplierBelongsToProject($project, $supplier);

        $supplier->delete();

        return back()->with('success', 'Supplier deleted.');
    }

    protected function ensureSupplierBelongsToProject(Project $project, Supplier $supplier): void
    {
        if ($supplier->project_id !== $project->id) {
            abort(403, 'Supplier does not belong to this project.');
        }
    }
}
