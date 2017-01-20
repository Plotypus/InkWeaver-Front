import { Injectable } from '@angular/core';

import { ParserService } from '../../shared/parser.service';

@Injectable()
export class SettingsService {
    constructor(private parser: ParserService) { }
}