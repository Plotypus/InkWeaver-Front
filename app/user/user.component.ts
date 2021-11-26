import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/primeng';

import { ApiService } from '../shared/api.service';
import { UserService } from './user.service';
import { StoryService } from '../story/story.service';
import { WikiService } from '../story/wiki/wiki.service';

import { ID } from '../models/id.model';
import { User } from '../models/user/user.model';
import { Section } from '../models/story/section.model';
import { StorySummary } from '../models/story/story-summary.model';

@Component({
    selector: 'user',
    templateUrl: './app/user/user.component.html'
})
export class UserComponent {
    private data: any;

    // User
    private nameActive: boolean;
    private emailActive: boolean;
    private bioActive: boolean;
    private prevName: string;
    private prevEmail: string;
    private prevBio: string;

    // Wiki
    private wikis: SelectItem[];
    private newWiki: any;
    private newWikiTitle: string;
    private newWikiSummary: string;

    // Story
    private title: string;
    private summary: string;
    private colors: string[];
    private displayStoryCreator: boolean;
    private displayStoryDeleter: boolean;
    private deletedStory: StorySummary = new StorySummary();

    constructor(
        private router: Router,
        private userService: UserService,
        private storyService: StoryService,
        private wikiService: WikiService,
        private apiService: ApiService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        // Unsubscribe if subscribed
        if (this.apiService.subscribedToStory) {
            this.storyService.unsubscribeFromStory(this.data.story.story_id);
        }
        if (this.apiService.subscribedToWiki) {
            this.storyService.unsubscribeFromWiki(this.data.story.wiki_id);
        }

        // Go back to the login page if not initialized
        if (!this.apiService.messages) {
            this.router.navigate(['/login']);
        }

        this.userService.getUserPreferences();
        this.userService.getUserStoriesAndWikis();
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

    // User editing
    public edit(field: string) {
        switch (field) {
            case 'name':
                this.nameActive = true;
                this.prevName = this.data.user.name;
                break;
            case 'email':
                this.emailActive = true;
                this.prevEmail = this.data.user.email;
                break;
            case 'bio':
                this.bioActive = true;
                this.prevBio = this.data.user.bio;
                break;
        }
    }
    // Cancel user editing
    public cancel(field: string) {
        switch (field) {
            case 'name':
                this.nameActive = false;
                this.data.user.name = this.prevName;
                break;
            case 'email':
                this.emailActive = false;
                this.data.user.email = this.prevEmail;
                break;
            case 'bio':
                this.bioActive = false;
                this.data.user.bio = this.prevBio;
                break;
        }
    }
    // Save user editing
    public save(field: string) {
        switch (field) {
            case 'name':
                this.nameActive = false;
                this.userService.setUserName(this.data.user.name);
                break;
            case 'email':
                this.emailActive = false;
                this.userService.setUserEmail(this.data.user.email);
                break;
            case 'bio':
                this.bioActive = false;
                this.userService.setUserBio(this.data.user.bio);
                break;
        }
    }

    // Select a story
    public selectStory(story: StorySummary) {
        this.data.storyDisplay = '';
        this.data.section = new Section();
        this.data.storyNode = new Array<TreeNode>();

        this.data.story.story_id = story.story_id;
        this.data.wiki.wiki_id = story.wiki_summary.wiki_id;
        this.data.story.story_title = story.title;
        this.data.story.position_context = story.position_context;
        this.data.page = null;
        this.data.selectedEntry = null;
        this.storyService.subscribeToStory(story.story_id);
        this.storyService.subscribeToWiki(story.wiki_summary.wiki_id);
        this.router.navigate(['/story/edit']);
    }

    // Create a story
    public openStoryCreator() {
        this.title = '';
        this.summary = '';
        this.newWikiTitle = '';
        this.newWikiSummary = '';
        this.displayStoryCreator = true;
        this.wikis = [{ label: 'Create New Notebook', value: 'newWiki' }];
        for (let wiki of this.data.wikis) {
            if (wiki.title) {
                this.wikis.unshift({ label: wiki.title, value: wiki.wiki_id });
            }
        }
        this.newWiki = this.wikis[0].value;
    }
    public createStory() {
        this.displayStoryCreator = false;
        if (this.newWiki === 'newWiki') {
            this.wikiService.createWiki(this.newWikiTitle, this.newWikiSummary, (reply: any) => {
                this.storyService.createStory(this.title, reply.wiki_id, this.summary);
            });
        } else {
            for (let wiki of this.data.wikis) {
                if (JSON.stringify(this.newWiki) === JSON.stringify(wiki.wiki_id)) {
                    this.data.newWiki = wiki;
                }
            }
            this.storyService.createStory(this.title, this.newWiki, this.summary);
        }
    }

    // Delete a story
    public openStoryDeleter(event: any, story: StorySummary) {
        event.stopPropagation();
        this.deletedStory = story;
        this.displayStoryDeleter = true;
    }
    public deleteStory() {
        this.displayStoryDeleter = false;
        this.storyService.deleteStory(this.deletedStory.story_id);
    }

    // Other
    public randomColor(title: string) {
        return this.colors[title.length % this.colors.length];
    }
}
