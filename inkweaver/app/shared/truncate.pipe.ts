﻿import { Pipe } from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe {
    transform(value: string, limit: number): string {
        // Truncate the string based on the limit
        return value.length > limit ? value.substring(0, limit) + '...' : value;
    }
}
