import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, Event } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { ApiService } from '../shared/api.service';
import { StoryService } from './story.service';

@Component({
    selector: 'story',
    templateUrl: './app/story/story.component.html'
})
export class StoryComponent {
    private data: any;
    private items: MenuItem[];
    private activeItem: MenuItem;

    private editing: boolean;
    private prevTitle: string;

    constructor(
        private router: Router,
        private apiService: ApiService,
        private storyService: StoryService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            { label: '', disabled: true, icon: 'fa-pencil-square-o', routerLink: ['/story/edit'] },
            { label: '', disabled: true, icon: 'fa-book', routerLink: ['/story/wiki'] },
            { label: '', disabled: true, icon: 'fa-ellipsis-v', routerLink: ['/story/stats'] }
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
                else if (event.url === '/story/stats') {
                    this.activeItem = this.items[2];
                }
            });

        this.apiService.messages.subscribe((action: string) => {
            if (action == "got_wiki_hierarchy")
            {
                for(let item of this.items)
                {
                    item['disabled'] = false;
                }
            }
        });
    }

    public edit() {
        this.editing = true;
        this.prevTitle = this.data.story.story_title;
    }
    public save() {
        this.editing = false;
        this.storyService.editStory(this.data.story.story_id, this.data.story.story_title);
    }
    public cancel() {
        this.editing = false;
        this.data.story.story_title = this.prevTitle;
    }
}
