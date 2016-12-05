import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { ParserService } from './shared/parser.service';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;
    private items: MenuItem[];

    constructor(parser: ParserService) {
        this.data = parser.data;
        console.log(this.data);

        this.items = [
            { label: '', icon: 'fa-pencil-square-o', routerLink: ['/edit'] },
            { label: '', icon: 'fa-book', routerLink: ['/wiki'] },
            { label: '', icon: 'fa-ellipsis-v', routerLink: ['/settings'] }
        ];
    }
}
