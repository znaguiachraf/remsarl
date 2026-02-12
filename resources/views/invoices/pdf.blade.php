@php
    $showTva = $showTva ?? true;
    $hasTvaOnSale = ($invoice->include_tva ?? $sale->include_tva ?? false) && (($invoice->tva_amount ?? $sale->tax ?? 0) > 0);
    $tvaRate = $invoice->tva_rate ?? $sale->tva_rate ?? 0;
    $tvaAmount = $invoice->tva_amount ?? $sale->tax ?? 0;
    $subtotal = $sale->subtotal ?? 0;
    $discount = $sale->discount ?? 0;
    $subtotalAfterDiscount = $subtotal - $discount;
    $displayTotal = $showTva && $hasTvaOnSale ? ($invoice->total_amount ?? 0) : $subtotalAfterDiscount;
    $invoiceTypeLabel = $showTva ? ($hasTvaOnSale ? 'TVA included (TTC)' : 'No TVA') : 'Without TVA (HT)';
    $logoDataUri = null;
    if ($sale->project?->logo && \Illuminate\Support\Facades\Storage::disk('public')->exists($sale->project->logo)) {
        $path = storage_path('app/public/' . $sale->project->logo);
        $mime = mime_content_type($path) ?: 'image/png';
        $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    } elseif ($sale->project?->logo_url) {
        $logoDataUri = $sale->project->logo_url;
    }
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        :root { --primary: {{ $sale->project->primary_color ?? '#3B82F6' }}; --text: #1f2937; --text-muted: #4b5563; }
        body { font-family: sans-serif; font-size: 12px; color: var(--text); max-width: 800px; margin: 0 auto; padding: 20px; }
        .logo-wrap { text-align: center; margin-bottom: 24px; }
        .logo-wrap img { max-height: 80px; max-width: 200px; object-fit: contain; }
        .actions { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
        .actions button, .actions a { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-print { background: var(--primary); color: white; }
        .btn-print:hover { opacity: 0.9; }
        .btn-download { background: #059669; color: white; }
        .btn-download:hover { opacity: 0.9; }
        @media print { .actions { display: none !important; } }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; color: var(--primary); }
        .header p, .meta p { color: var(--text-muted); margin: 4px 0; }
        .meta { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; color: var(--text); }
        th { background: #f3f4f6; color: var(--text); font-weight: 600; }
        .total-row { font-weight: bold; color: var(--primary); }
        .total-row td { border-top: 2px solid var(--primary); }
        .text-right { text-align: right; }
        .mt-20 { margin-top: 20px; }
        .invoice-type { display: inline-block; margin-top: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .invoice-type.tva-included { background: #d1fae8; color: #065f46; }
        .invoice-type.no-tva { background: #e5e7eb; color: #4b5563; }
        .invoice-type.without-tva { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    @if($logoDataUri)
    <div class="logo-wrap">
        <img src="{{ $logoDataUri }}" alt="{{ $sale->project->name ?? 'Logo' }}">
    </div>
    @endif

    <div class="actions no-print">
        <button type="button" class="btn-print" onclick="window.print()">Print</button>
        <a href="{{ route('projects.modules.sales.invoice.pdf', [$sale->project_id, $sale->id]) }}?download=1&tva={{ $showTva ? '1' : '0' }}" class="btn-download" download>Download PDF</a>
    </div>

    <div class="header">
        <div>
            <h1>Invoice {{ $invoice->invoice_number }}</h1>
            <p>{{ $sale->project->name ?? config('app.name') }}</p>
            <p style="color: var(--text-muted);">Sale: {{ $sale->sale_number }}</p>
            @if($showTva && $hasTvaOnSale)
                <span class="invoice-type tva-included">TVA included — {{ number_format($tvaRate, 1) }}% (Total TTC)</span>
            @elseif($showTva)
                <span class="invoice-type no-tva">No TVA</span>
            @else
                <span class="invoice-type without-tva">Invoice without TVA (amounts HT)</span>
            @endif
        </div>
        <div class="meta">
            <p>Date: {{ $invoice->created_at->format('Y-m-d') }}</p>
            <p>Status: {{ ucfirst($invoice->status) }}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->saleItems ?? [] as $item)
            <tr>
                <td>{{ $item->product?->name ?? '—' }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="mt-20" style="width: 320px; margin-left: auto;">
        <tr>
            <td>{{ ($showTva && $hasTvaOnSale) ? 'Subtotal (HT)' : 'Subtotal' }}</td>
            <td class="text-right">{{ number_format($subtotal, 2) }}</td>
        </tr>
        @if($discount > 0)
        <tr>
            <td>Discount</td>
            <td class="text-right">-{{ number_format($discount, 2) }}</td>
        </tr>
        @endif
        @if($showTva && $hasTvaOnSale)
        <tr>
            <td>TVA ({{ number_format($tvaRate, 1) }}%)</td>
            <td class="text-right">{{ number_format($tvaAmount, 2) }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td>{{ $showTva && $hasTvaOnSale ? 'Total (TTC)' : 'Total' }}{{ !$showTva ? ' (HT)' : '' }}</td>
            <td class="text-right">{{ number_format($displayTotal, 2) }}</td>
        </tr>
    </table>
</body>
</html>
