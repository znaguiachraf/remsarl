<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Payment;
use App\Models\Project;
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
            'payment_method' => $request->get('payment_method'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
            'per_page' => $request->get('per_page', 20),
        ]);

        $user = $request->user();

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
                'payment_method' => $request->get('payment_method'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ],
            'filterOptions' => [
                'statuses' => ['paid', 'partial', 'failed', 'refunded'],
            ],
            'can' => [
                'create' => false,
            ],
        ]);
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
            'payment_method' => 'required|string|' . PaymentMethod::validationRule(),
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
        $payableLabel = match (true) {
            $payable instanceof \App\Models\Sale => 'Sale #' . $payable->sale_number,
            $payable instanceof \App\Models\Expense => 'Expense #' . $payable->id . ($payable->description ? ' — ' . \Illuminate\Support\Str::limit($payable->description, 30) : ''),
            $payable instanceof \App\Models\Salary => 'Salary #' . $p->payable_id,
            default => $p->sale_id ? ('Sale #' . $p->sale_id) : ('Payment #' . $p->id),
        };

        return [
            'id' => $p->id,
            'sale_id' => $p->sale_id,
            'sale_label' => $payableLabel,
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

    protected function ensurePaymentBelongsToProject(Project $project, Payment $payment): void
    {
        if ($payment->project_id !== $project->id) {
            abort(403, 'Payment does not belong to this project.');
        }
    }
}
