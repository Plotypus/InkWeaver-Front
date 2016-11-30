import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private title: string;
    private items: MenuItem[];

    constructor() {
        this.title = 'My Great Story';
        this.items = [
            { label: 'Edit', icon: 'fa-pencil-square-o', routerLink: ['/edit'] },
            { label: 'Wiki', icon: 'fa-book', routerLink: ['/wiki'] },
            { label: 'Settings', icon: 'fa-cogs', routerLink: ['/settings'] }
        ];
    }
}
