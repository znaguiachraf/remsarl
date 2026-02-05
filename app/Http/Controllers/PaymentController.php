<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function index(Project $project, Request $request): Response
    {
        $this->authorize('viewAny', [Payment::class, $project]);

        $payments = $this->paymentService->list($project, [
            'status' => $request->get('status'),
            'payable_type' => $request->get('payable_type'),
            'payment_method' => $request->get('payment_method'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
            'per_page' => $request->get('per_page', 20),
        ]);

        $payableTypes = Payment::where('project_id', $project->id)
            ->whereNotNull('payable_type')
            ->select('payable_type')
            ->distinct()
            ->orderBy('payable_type')
            ->pluck('payable_type');

        $user = $request->user();
        $canCreate = $user->can('create', [Payment::class, $project]);

        $payables = [];
        if ($canCreate) {
            $payables = $this->getPayablesWithBalance($project);
        }

        return Inertia::render('Payments/Index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'payments' => [
                'data' => $payments->map(fn ($p) => $this->formatPayment($p, $user)),
                'links' => $payments->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ],
            ],
            'filters' => [
                'status' => $request->get('status'),
                'payable_type' => $request->get('payable_type'),
                'payment_method' => $request->get('payment_method'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ],
            'filterOptions' => [
                'statuses' => ['paid', 'partial', 'failed', 'refunded'],
                'payable_types' => $payableTypes->map(fn ($t) => [
                    'value' => $t,
                    'label' => class_basename($t),
                ])->values()->toArray(),
                'payment_methods' => ['cash', 'card', 'transfer', 'check', 'other'],
            ],
            'payables' => $payables,
            'can' => [
                'create' => $canCreate,
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [Payment::class, $project]);

        $request->merge([
            'payable_id' => $request->input('payable_id') ?: null,
        ]);

        $validated = $request->validate([
            'payable_type' => 'required|string|in:' . Expense::class . ',' . Sale::class . ',' . Order::class,
            'payable_id' => 'required|integer',
            'payment_method' => 'required|string|in:cash,card,transfer,check,other',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $this->paymentService->create($project, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment recorded.');
    }

    public function refund(Project $project, Payment $payment)
    {
        $this->authorize('refund', $payment);
        $this->ensurePaymentBelongsToProject($project, $payment);

        try {
            $this->paymentService->refund($payment);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Payment refunded.');
    }

    public function reinstate(Project $project, Payment $payment)
    {
        $this->authorize('reinstate', $payment);
        $this->ensurePaymentBelongsToProject($project, $payment);

        try {
            $this->paymentService->reinstate($payment);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Payment reinstated.');
    }

    public function update(Request $request, Project $project, Payment $payment)
    {
        $this->authorize('update', $payment);
        $this->ensurePaymentBelongsToProject($project, $payment);

        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,card,transfer,check,other',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'status' => 'required|string|in:paid,partial,failed',
        ]);

        try {
            $this->paymentService->update($payment, $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment updated.');
    }

    public function destroy(Project $project, Payment $payment)
    {
        $this->authorize('delete', $payment);
        $this->ensurePaymentBelongsToProject($project, $payment);

        $this->paymentService->delete($payment);

        return back()->with('success', 'Payment deleted.');
    }

    protected function formatPayment(Payment $p, $user): array
    {
        $payable = $p->payable;
        $payableLabel = $payable
            ? (class_basename($payable) . ' #' . $payable->getKey())
            : ($p->payable_type . ' #' . $p->payable_id);

        return [
            'id' => $p->id,
            'payable_type' => $p->payable_type,
            'payable_type_label' => class_basename($p->payable_type),
            'payable_id' => $p->payable_id,
            'payable_label' => $payableLabel,
            'payment_method' => $p->payment_method,
            'amount' => (float) $p->amount,
            'reference' => $p->reference,
            'payment_date' => $p->payment_date->format('Y-m-d'),
            'status' => $p->status->value,
            'status_label' => $p->status->label(),
            'user' => $p->user ? ['id' => $p->user->id, 'name' => $p->user->name] : null,
            'notes' => $p->notes,
            'created_at' => $p->created_at->toISOString(),
            'can_refund' => $user->can('refund', $p),
            'can_reinstate' => $user->can('reinstate', $p),
            'can_update' => $user->can('update', $p),
            'can_delete' => $user->can('delete', $p),
        ];
    }

    protected function getPayablesWithBalance(Project $project): array
    {
        $expenses = Expense::forProject($project)
            ->where('status', 'pending')
            ->withSum(['payments as total_paid' => fn ($q) => $q->whereNotIn('status', ['failed', 'refunded'])], 'amount')
            ->orderByDesc('expense_date')
            ->get(['id', 'reference', 'description', 'amount', 'expense_date']);

        $sales = Sale::forProject($project)
            ->get()
            ->filter(fn ($s) => $s->total_paid < $s->total_due)
            ->values()
            ->map(fn ($s) => (object) [
                'id' => $s->id,
                'reference' => $s->sale_number,
                'description' => 'Sale',
                'amount' => $s->total,
                'total_paid' => $s->total_paid,
                'remaining' => $s->total_due - $s->total_paid,
            ]);

        $orders = Order::forProject($project)
            ->get()
            ->filter(fn ($o) => $o->total_paid < $o->total_due)
            ->values()
            ->map(fn ($o) => (object) [
                'id' => $o->id,
                'reference' => $o->order_number,
                'description' => 'Order',
                'amount' => $o->total,
                'total_paid' => $o->total_paid,
                'remaining' => $o->total_due - $o->total_paid,
            ]);

        return [
            'expenses' => $expenses->map(fn ($e) => [
                'id' => $e->id,
                'reference' => $e->reference,
                'description' => $e->description,
                'amount' => (float) $e->amount,
                'remaining' => max(0, (float) $e->amount - (float) ($e->total_paid ?? 0)),
            ])->values()->toArray(),
            'sales' => $sales->map(fn ($s) => [
                'id' => $s->id,
                'reference' => $s->reference,
                'description' => $s->description,
                'amount' => (float) $s->amount,
                'remaining' => (float) $s->remaining,
            ])->values()->toArray(),
            'orders' => $orders->map(fn ($o) => [
                'id' => $o->id,
                'reference' => $o->reference,
                'description' => $o->description,
                'amount' => (float) $o->amount,
                'remaining' => (float) $o->remaining,
            ])->values()->toArray(),
        ];
    }

    protected function ensurePaymentBelongsToProject(Project $project, Payment $payment): void
    {
        if ($payment->project_id !== $project->id) {
            abort(403, 'Payment does not belong to this project.');
        }
    }
}
