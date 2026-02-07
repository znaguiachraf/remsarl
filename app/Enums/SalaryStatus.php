<?php

namespace App\Enums;

enum SalaryStatus: string
{
    case Draft = 'draft';
    case Generated = 'generated';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Generated => 'Generated',
            self::Paid => 'Paid',
            self::Cancelled => 'Cancelled',
        };
    }
}
