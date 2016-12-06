import { Component } from '@angular/core';
import { Router, NavigationStart, Event } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { ParserService } from './shared/parser.service';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;
    private items: MenuItem[];
    private activeItem: MenuItem;

    constructor(private router: Router, parser: ParserService) {
        this.data = parser.data;
        this.items = [
            { label: '', icon: 'fa-pencil-square-o', routerLink: ['/edit'] },
            { label: '', icon: 'fa-book', routerLink: ['/wiki'] },
            { label: '', icon: 'fa-ellipsis-v', routerLink: ['/settings'] }
        ];

        this.activeItem = this.items[0];


        //this changes the navigation bar highlight
        router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: Event) => {
                if (event.url === '/' || event.url === '/edit') {
                    this.activeItem = this.items[0];
                }
                else if (event.url === '/wiki')
                    this.activeItem = this.items[1];
                else if (event.url === '/settings')
                    this.activeItem = this.items[2];
            });

    }
}
