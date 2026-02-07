<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Absent = 'absent';
    case HalfDay = 'half_day';
    case Leave = 'leave';
    case Late = 'late';
    case Excused = 'excused';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Present',
            self::Absent => 'Absent',
            self::HalfDay => 'Half day',
            self::Leave => 'Leave',
            self::Late => 'Late',
            self::Excused => 'Excused',
        };
    }
}
