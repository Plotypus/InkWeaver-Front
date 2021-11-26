"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const router_1 = require('@angular/router');
const api_service_1 = require('../shared/api.service');
const user_service_1 = require('./user.service');
const story_service_1 = require('../story/story.service');
const wiki_service_1 = require('../story/wiki/wiki.service');
const section_model_1 = require('../models/story/section.model');
const story_summary_model_1 = require('../models/story/story-summary.model');
let UserComponent = class UserComponent {
    constructor(router, userService, storyService, wikiService, apiService) {
        this.router = router;
        this.userService = userService;
        this.storyService = storyService;
        this.wikiService = wikiService;
        this.apiService = apiService;
        this.deletedStory = new story_summary_model_1.StorySummary();
    }
    ngOnInit() {
        this.data = this.apiService.data;
        if (this.apiService.subscribedToStory) {
            this.storyService.unsubscribeFromStory(this.data.story.story_id);
        }
        if (this.apiService.subscribedToWiki) {
            this.storyService.unsubscribeFromWiki(this.data.story.wiki_id);
        }
        if (!this.apiService.messages) {
            this.router.navigate(['/login']);
        }
        this.userService.getUserPreferences();
        this.userService.getUserStoriesAndWikis();
        this.colors = [
            '#cb735c',
            '#fdd17c',
            '#acd8b4',
            '#4d6b61',
            '#b0c9dd',
            '#74b0b8',
            '#8779c3',
            '#903737'
        ];
    }
    edit(field) {
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
    cancel(field) {
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
    save(field) {
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
    selectStory(story) {
        this.data.storyDisplay = '';
        this.data.section = new section_model_1.Section();
        this.data.storyNode = new Array();
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
    openStoryCreator() {
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
    createStory() {
        this.displayStoryCreator = false;
        if (this.newWiki === 'newWiki') {
            this.wikiService.createWiki(this.newWikiTitle, this.newWikiSummary, (reply) => {
                this.storyService.createStory(this.title, reply.wiki_id, this.summary);
            });
        }
        else {
            for (let wiki of this.data.wikis) {
                if (JSON.stringify(this.newWiki) === JSON.stringify(wiki.wiki_id)) {
                    this.data.newWiki = wiki;
                }
            }
            this.storyService.createStory(this.title, this.newWiki, this.summary);
        }
    }
    openStoryDeleter(event, story) {
        event.stopPropagation();
        this.deletedStory = story;
        this.displayStoryDeleter = true;
    }
    deleteStory() {
        this.displayStoryDeleter = false;
        this.storyService.deleteStory(this.deletedStory.story_id);
    }
    randomColor(title) {
        return this.colors[title.length % this.colors.length];
    }
};
UserComponent = __decorate([
    core_1.Component({
        selector: 'user',
        templateUrl: './app/user/user.component.html'
    }), 
    __metadata('design:paramtypes', [router_1.Router, user_service_1.UserService, story_service_1.StoryService, wiki_service_1.WikiService, api_service_1.ApiService])
], UserComponent);
exports.UserComponent = UserComponent;
//# sourceMappingURL=user.component.js.map