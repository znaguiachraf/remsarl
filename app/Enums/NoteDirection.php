<?php

namespace App\Enums;

enum NoteDirection: string
{
    case ToEmployee = 'to_employee';
    case FromEmployee = 'from_employee';

    public function label(): string
    {
        return match ($this) {
            self::ToEmployee => 'To employee',
            self::FromEmployee => 'From employee',
        };
    }
}
