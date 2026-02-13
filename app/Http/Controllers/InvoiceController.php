<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sale;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * Create invoice from sale (fallback when none exists).
     */
    public function createFromSale(Project $project, Sale $sale)
    {
        $this->authorize('view', $sale);
        $this->ensureSaleBelongsToProject($project, $sale);

        $invoice = $this->invoiceService->createFromSale($sale);

        return back()->with('success', "Invoice {$invoice->invoice_number} created.");
    }

    /**
     * Generate and download PDF invoice for sale.
     * Query: tva=1 (with TVA, default) or tva=0 (without TVA).
     */
    public function pdf(Project $project, Sale $sale, Request $request)
    {
        $this->authorize('view', $sale);
        $this->ensureSaleBelongsToProject($project, $sale);

        $showTva = $request->boolean('tva', true);
        $pdf = $this->invoiceService->generatePdf($sale, $showTva);
        $invoice = $sale->invoice;
        $isPdf = class_exists(\Barryvdh\DomPDF\Facade\Pdf::class);
        $ext = $isPdf ? 'pdf' : 'html';
        $filename = 'invoice-' . ($invoice->invoice_number ?? $sale->sale_number) . '.' . $ext;
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response($pdf, 200, [
            'Content-Type' => $isPdf ? 'application/pdf' : 'text/html',
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Send invoice email to sale customer.
     */
    public function send(Project $project, Sale $sale, Request $request)
    {
        $this->authorize('view', $sale);
        $this->ensureSaleBelongsToProject($project, $sale);

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $this->invoiceService->sendEmail($sale, $validated['email']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['email' => $e->getMessage()]);
        }

        return back()->with('success', 'Invoice sent.');
    }

    protected function ensureSaleBelongsToProject(Project $project, Sale $sale): void
    {
        if ($sale->project_id !== $project->id) {
            abort(403, 'Sale does not belong to this project.');
        }
    }
}
