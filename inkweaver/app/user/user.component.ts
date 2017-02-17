import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from 'primeng/primeng';

import { UserService } from './user.service';
import { EditService } from '../story/edit/edit.service';
import { WikiService } from '../story/wiki/wiki.service';
import { ApiService } from '../shared/api.service';

import { ID } from '../models/id.model';

@Component({
    moduleId: module.id,
    selector: 'user',
    templateUrl: './user.component.html'
})
export class UserComponent {
    private data: any;

    private wikis: any;
    private newWiki: any;
    private newWikiTitle: string;
    private newWikiSummary: string;

    private title: string;
    private summary: string;
    private colors: string[];
    private displayStoryCreator: boolean;

    constructor(
        private router: Router,
        private userService: UserService,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.data.menuItems = [
            { label: 'About', routerLink: ['/about'] },
            { label: 'Sign Out', routerLink: ['/login'] },
        ];
        if (this.data.stories.length == 0 ||
            this.data.stories[this.data.stories.length - 1].story_id) {
            this.data.stories.push({ story_id: null, title: null, access_level: null });
        }
        this.colors = [
            "#cb735c", // red-orange
            "#fdd17c", // yellow
            "#acd8b4", // pastel green
            "#4d6b61", // green
            "#b0c9dd", // light blue
            "#74b0b8", // muted blue
            "#8779c3", // purple
            "#903737"  // maroon
        ];

        if (this.apiService.messages) {
            this.apiService.messages.subscribe((action: string) => {
                if (action == 'create_wiki') {
                    this.displayStoryCreator = false;
                    this.editService.createStory(this.title, this.data.wiki.wiki_id, this.summary);
                    this.router.navigate(['/story/edit']);
                }
            });
        } else {
            this.router.navigate(['/login']);
        }
    }

    public selectStory(story_id: ID) {
        this.data.story.story_id = story_id;
        this.editService.getStoryInformation(story_id);
        this.editService.getStoryHierarchy(story_id);
        this.router.navigate(['/story/edit']);
    }

    public randomColor(title: string) {
        return this.colors[title.length % this.colors.length];
    }

    /* -------------------- Create a new story -------------------- */
    public openStoryCreator() {
        this.displayStoryCreator = true;
        this.wikis = [{ label: '[Create New Wiki]', value: 'new_wiki' }];
        for (let wiki of this.data.wikis) {
            this.wikis.push({ label: wiki.title, value: wiki.wiki_id });
        }
        this.newWiki = this.wikis[0].value;
    }

    public createStory() {
        if (this.newWiki == 'new_wiki') {
            this.wikiService.createWiki(this.newWikiTitle, this.newWikiSummary);
        } else {
            this.displayStoryCreator = false;
            this.editService.createStory(this.title, this.newWiki, this.summary);
            this.router.navigate(['/story/edit']);
        }
    }
}
