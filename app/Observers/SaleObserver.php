<?php

namespace App\Observers;

use App\Models\Sale;
use App\Services\InvoiceService;

class SaleObserver
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    public function created(Sale $sale): void
    {
        $this->invoiceService->createFromSale($sale);
    }
}
