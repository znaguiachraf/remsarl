<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Create invoice from sale (fallback when observer didn't run or for legacy sales).
     * Returns existing invoice if already present.
     */
    public function createFromSale(Sale $sale): Invoice
    {
        $invoice = $sale->invoice;
        if ($invoice) {
            return $invoice;
        }

        return DB::transaction(function () use ($sale) {
            $invoice = Invoice::create([
                'project_id' => $sale->project_id,
                'sale_id' => $sale->id,
                'invoice_number' => $this->generateInvoiceNumber($sale),
                'total_amount' => $sale->total,
                'status' => 'draft',
                'customer_email' => null,
            ]);

            return $invoice;
        });
    }

    public function generateInvoiceNumber(Sale $sale): string
    {
        $prefix = 'INV-' . now()->format('Ymd') . '-';
        $last = Invoice::where('project_id', $sale->project_id)
            ->where('invoice_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('invoice_number');

        $seq = 1;
        if ($last) {
            $seq = (int) substr($last, strlen($prefix)) + 1;
        }

        return $prefix . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate PDF invoice for sale.
     * Requires barryvdh/laravel-dompdf or similar. Returns raw PDF content.
     */
    public function generatePdf(Sale $sale): string
    {
        $invoice = $sale->invoice ?? $this->createFromSale($sale);
        $sale->load(['saleItems.product', 'project']);

        $html = view('invoices.pdf', [
            'invoice' => $invoice,
            'sale' => $sale,
        ])->render();

        return $this->renderPdf($html);
    }

    /**
     * Render HTML to PDF. Override or use DomPDF/Snappy in production.
     */
    protected function renderPdf(string $html): string
    {
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->output();
        }

        // Fallback: return HTML as placeholder until DomPDF is installed
        return $html;
    }

    /**
     * Send invoice email to sale customer.
     * Requires invoice.customer_email or fallback email.
     */
    public function sendEmail(Sale $sale, ?string $toEmail = null): void
    {
        $invoice = $sale->invoice ?? $this->createFromSale($sale);
        $email = $toEmail ?? $invoice->customer_email;

        if (empty($email)) {
            throw new \InvalidArgumentException('No customer email. Provide $toEmail or set invoice.customer_email.');
        }

        $pdf = $this->generatePdf($sale);
        $sale->load(['project']);

        // Use Mailable when available
        if (class_exists(\App\Mail\InvoiceMail::class)) {
            \Illuminate\Support\Facades\Mail::to($email)->send(
                new \App\Mail\InvoiceMail($invoice, $sale, $pdf)
            );
            return;
        }

        \Illuminate\Support\Facades\Mail::raw(
            "Invoice {$invoice->invoice_number} for Sale {$sale->sale_number}. Total: {$invoice->total_amount}",
            fn ($m) => $m->to($email)->subject("Invoice {$invoice->invoice_number}")
        );
    }
}
