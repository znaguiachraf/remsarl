<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .meta { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .total-row { font-weight: bold; }
        .text-right { text-align: right; }
        .mt-20 { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Invoice {{ $invoice->invoice_number }}</h1>
            <p>{{ $sale->project->name ?? config('app.name') }}</p>
            <p>Sale: {{ $sale->sale_number }}</p>
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

    <table class="mt-20" style="width: 300px; margin-left: auto;">
        <tr>
            <td>Subtotal</td>
            <td class="text-right">{{ number_format($sale->subtotal ?? 0, 2) }}</td>
        </tr>
        @if(($sale->discount ?? 0) > 0)
        <tr>
            <td>Discount</td>
            <td class="text-right">-{{ number_format($sale->discount, 2) }}</td>
        </tr>
        @endif
        @if(($sale->tax ?? 0) > 0)
        <tr>
            <td>Tax</td>
            <td class="text-right">{{ number_format($sale->tax, 2) }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td>Total</td>
            <td class="text-right">{{ number_format($invoice->total_amount, 2) }}</td>
        </tr>
    </table>
</body>
</html>
