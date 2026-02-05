<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function index(Project $project): Response
    {
        $this->authorize('viewAny', [Expense::class, $project]);

        $categories = ExpenseCategory::forProject($project)
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
                'description' => $c->description,
                'is_active' => $c->is_active,
                'expenses_count' => $c->expenses()->count(),
            ]);

        return Inertia::render('Expenses/Categories/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Expense::class, $project]);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        ExpenseCategory::create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Project $project, ExpenseCategory $category)
    {
        $this->authorize('manageCategories', [Expense::class, $project]);

        if ($category->project_id !== $project->id) {
            abort(403, 'Category does not belong to this project.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Project $project, ExpenseCategory $category)
    {
        $this->authorize('manageCategories', [Expense::class, $project]);

        if ($category->project_id !== $project->id) {
            abort(403, 'Category does not belong to this project.');
        }

        if ($category->expenses()->exists()) {
            return back()->with('error', 'Cannot delete category with existing expenses.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
