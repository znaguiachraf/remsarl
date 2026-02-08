<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Card = 'card';
    case Transfer = 'transfer';
    case Check = 'check';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Card => 'Card',
            self::Transfer => 'Transfer',
            self::Check => 'Check',
            self::Other => 'Other',
        };
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * For validation: 'in:' . implode(',', PaymentMethod::values())
     */
    public static function validationRule(): string
    {
        return 'in:' . implode(',', self::values());
    }
}
