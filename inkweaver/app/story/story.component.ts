import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, Event } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { ApiService } from '../shared/api.service';

@Component({
    selector: 'story',
    templateUrl: './app/story/story.component.html'
})
export class StoryComponent {
    private data: any;
    private items: MenuItem[];
    private activeItem: MenuItem;

    constructor(private router: Router, private apiService: ApiService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            { label: '', icon: 'fa-pencil-square-o', routerLink: ['/story/edit'] },
            { label: '', icon: 'fa-book', routerLink: ['/story/wiki'] },
            { label: '', icon: 'fa-ellipsis-v', routerLink: ['/story/settings'] }
        ];
        this.activeItem = this.items[0];

        // This changes the navigation bar highlight
        this.router.events
            .filter((event: Event) => event instanceof NavigationStart)
            .subscribe((event: Event) => {
                if (event.url === '/story/edit') {
                    this.activeItem = this.items[0];
                }
                else if (event.url === '/story/wiki') {
                    this.activeItem = this.items[1];
                }
                else if (event.url === '/story/settings') {
                    this.activeItem = this.items[2];
                }
            });
    }
}
