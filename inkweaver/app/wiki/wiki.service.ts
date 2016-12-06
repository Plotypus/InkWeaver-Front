import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';

@Injectable()
export class WikiService {
    constructor(private parser: ParserService) { }
}