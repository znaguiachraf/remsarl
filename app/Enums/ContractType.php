<?php

namespace App\Enums;

enum ContractType: string
{
    case CDI = 'cdi';
    case CDD = 'cdd';
    case Freelance = 'freelance';

    public function label(): string
    {
        return match ($this) {
            self::CDI => 'CDI (Indefinite)',
            self::CDD => 'CDD (Fixed-term)',
            self::Freelance => 'Freelance',
        };
    }
}
