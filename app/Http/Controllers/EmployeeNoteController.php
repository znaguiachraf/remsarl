<?php

namespace App\Http\Controllers;

use App\Models\EmployeeNote;
use App\Models\Project;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeNoteController extends Controller
{
    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [EmployeeNote::class, $project]);

        $query = EmployeeNote::forProject($project)
            ->with(['worker', 'author'])
            ->latest();

        if ($request->filled('worker_id')) {
            $query->where('worker_id', $request->worker_id);
        }

        $notes = $query->limit(50)->get()
            ->filter(fn ($n) => $n->worker && $n->author)
            ->map(fn ($n) => [
                'id' => $n->id,
                'content' => $n->content,
                'direction' => $n->direction,
                'created_at' => $n->created_at->toISOString(),
                'worker' => [
                    'id' => $n->worker->id,
                    'full_name' => $n->worker->full_name,
                ],
                'author' => [
                    'id' => $n->author->id,
                    'name' => $n->author->name,
                ],
            ])
            ->values();

        $workers = Worker::forProject($project)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($w) => [
                'id' => $w->id,
                'full_name' => $w->full_name,
            ]);

        $user = $request->user();

        return Inertia::render('Notes/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'notes' => $notes,
            'workers' => $workers,
            'filters' => [
                'worker_id' => $request->worker_id,
            ],
            'can' => [
                'create' => $user->can('create', [EmployeeNote::class, $project]),
            ],
            'hasHrModule' => $project->hasModule('hr'),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [EmployeeNote::class, $project]);

        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'content' => 'required|string|max:2000',
            'direction' => 'required|in:to_employee,from_employee',
        ]);

        $worker = Worker::forProject($project)->findOrFail($validated['worker_id']);

        EmployeeNote::create([
            'project_id' => $project->id,
            'worker_id' => $worker->id,
            'author_id' => $request->user()->id,
            'content' => $validated['content'],
            'direction' => $validated['direction'],
        ]);

        return back()->with('success', 'Note added.');
    }
}
