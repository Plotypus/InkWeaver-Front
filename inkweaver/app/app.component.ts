import { Component, OnInit } from '@angular/core';

import { ParserService } from './shared/parser.service';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;

    constructor(private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.parserService.data;
    }
}
