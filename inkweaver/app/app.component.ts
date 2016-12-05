import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { Router, NavigationStart, Event} from '@angular/router';
import 'rxjs/add/operator/filter';
@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private title: string;
    private items: MenuItem[];
    private activeItem: MenuItem;

    constructor(private router: Router) {
        this.title = 'My Great Story';
        this.items = [
            { label: 'Edit', icon: 'fa-pencil-square-o', routerLink: ['/edit'] },
            { label: 'Wiki', icon: 'fa-book', routerLink: ['/wiki'] },
            { label: 'Settings', icon: 'fa-cogs', routerLink: ['/settings'] }
        ];
        this.activeItem = this.items[0];


        //this changes the navigation bar highlight
        router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: Event) => {
                if (event.url === '/' || event.url === '/edit' )
                {
                    this.activeItem = this.items[0];
                }
                else if (event.url === '/wiki')
                    this.activeItem = this.items[1];
                else if (event.url === '/settings')
                    this.activeItem = this.items[2];
            });
         
    }
}
