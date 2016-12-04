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
        this.title = 'Mos Eisley Trip';
        this.items = [
            { label: '', icon: 'fa-pencil-square-o', routerLink: ['/edit'] },
            { label: '', icon: 'fa-book', routerLink: ['/wiki'] },
            { label: '', icon: 'fa-ellipsis-v', routerLink: ['/settings'] }
        ];
    }
}
