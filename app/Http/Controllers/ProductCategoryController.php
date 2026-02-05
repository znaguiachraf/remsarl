<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(Project $project): Response
    {
        $this->authorize('manageCategories', [Product::class, $project]);

        $categories = ProductCategory::forProject($project)->withCount('products')->orderBy('name')->get();

        return Inertia::render('Products/Categories/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
                'description' => $c->description,
                'is_active' => $c->is_active,
                'products_count' => $c->products_count,
            ]),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('manageCategories', [Product::class, $project]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        ProductCategory::create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Project $project, ProductCategory $category)
    {
        $this->authorize('manageCategories', [Product::class, $project]);

        if ($category->project_id !== $project->id) {
            abort(403, 'Category does not belong to this project.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Project $project, ProductCategory $category)
    {
        $this->authorize('manageCategories', [Product::class, $project]);

        if ($category->project_id !== $project->id) {
            abort(403, 'Category does not belong to this project.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
