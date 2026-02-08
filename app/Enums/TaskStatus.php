<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Pending = 'pending';
    case Done = 'done';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Done => 'Done',
        };
    }
}
