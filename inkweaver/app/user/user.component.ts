import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/primeng';

import { UserService } from './user.service';
import { StoryService } from '../story/story.service';
import { WikiService } from '../story/wiki/wiki.service';
import { ApiService } from '../shared/api.service';

import { ID } from '../models/id.model';
import { User } from '../models/user/user.model';
import { StorySummary } from '../models/story/story-summary.model';
import { Section } from '../models/story/section.model';

@Component({
    selector: 'user',
    templateUrl: './app/user/user.component.html'
})
export class UserComponent {
    private data: any;
    private editing: boolean;
    private backup: User;

    private wikis: SelectItem[];
    private newWiki: any;
    private newWikiTitle: string;
    private newWikiSummary: string;

    private deleteID: ID;
    private title: string;
    private summary: string;
    private colors: string[];
    private displayStoryCreator: boolean;
    private displayStoryDeleter: boolean;

    constructor(
        private router: Router,
        private userService: UserService,
        private storyService: StoryService,
        private wikiService: WikiService,
        private apiService: ApiService) { }

    ngOnInit() {
        if (!this.apiService.messages) {
            this.router.navigate(['/login']);
        }

        this.apiService.refreshUser();
        this.data = this.apiService.data;
        this.data.menuItems = [
            { label: 'About', routerLink: ['/about'] },
            { label: 'Sign Out', routerLink: ['/login'] },
        ];

        this.editing = false;
        this.colors = [
            '#cb735c', // red-orange
            '#fdd17c', // yellow
            '#acd8b4', // pastel green
            '#4d6b61', // green
            '#b0c9dd', // light blue
            '#74b0b8', // muted blue
            '#8779c3', // purple
            '#903737'  // maroon
        ];
    }

    // User
    public edit() {
        this.backup = JSON.parse(JSON.stringify(this.data.user));
        this.editing = true;
    }
    public cancel() {
        this.data.user = this.backup;
        this.editing = false;
    }
    public save() {
        this.userService.setUserName(this.data.user.name);
        this.userService.setUserEmail(this.data.user.email);
        this.userService.setUserBio(this.data.user.bio);
        this.editing = false;
    }

    // Stories
    public selectStory(story: StorySummary) {
        this.data.storyDisplay = '';
        this.data.section = new Section();
        this.data.storyNode = new Array<TreeNode>();

        this.data.story.story_id = story.story_id;
        this.data.story.story_title = story.title;
        this.data.story.position_context = story.position_context;

        this.storyService.getStoryInformation(story.story_id);
        this.router.navigate(['/story/edit']);
    }

    public openStoryCreator() {
        this.displayStoryCreator = true;
        this.wikis = [{ label: 'Create New Wiki', value: 'new_wiki' }];
        for (let wiki of this.data.wikis) {
            this.wikis.push({ label: wiki.title, value: wiki.wiki_id });
        }
        this.newWiki = this.wikis[0].value;
    }
    public createStory() {
        if (this.newWiki === 'new_wiki') {
            this.wikiService.createWiki(this.newWikiTitle, this.newWikiSummary, (reply: any) => {
                this.data.storyDisplay = '';
                this.data.section = new Section();
                this.data.storyNode = new Array<TreeNode>();

                this.displayStoryCreator = false;
                this.data.story.story_title = this.title;
                this.storyService.createStory(this.title, reply.wiki_id, this.summary);
                this.router.navigate(['/story/edit']);
            });
        } else {
            this.data.storyDisplay = '';
            this.data.section = new Section();
            this.data.storyNode = new Array<TreeNode>();

            this.displayStoryCreator = false;
            this.data.story.story_title = this.title;
            this.storyService.createStory(this.title, this.newWiki, this.summary);

            this.router.navigate(['/story/edit']);
        }
    }

    public openStoryDeleter(event: any, storyID: ID) {
        this.deleteID = storyID;
        this.displayStoryDeleter = true;
        event.stopPropagation();
    }
    public deleteStory() {
        this.displayStoryDeleter = false;
        this.storyService.deleteStory(this.deleteID);
    }

    // Other
    public randomColor(title: string) {
        return this.colors[title.length % this.colors.length];
    }
}
