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
const parser_service_1 = require('../shared/parser.service');
const story_service_1 = require('./story.service');
let StoryComponent = class StoryComponent {
    constructor(router, apiService, storyService, parserService) {
        this.router = router;
        this.apiService = apiService;
        this.storyService = storyService;
        this.parserService = parserService;
    }
    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            {
                label: '', disabled: true, icon: 'fa-pencil-square-o', routerLink: ['/story/edit'],
                command: (event) => { this.apiService.refreshStoryContent(); }
            },
            { label: '', disabled: true, icon: 'fa-book', routerLink: ['/story/wiki'] },
        ];
        this.activeItem = this.items[0];
        this.router.events
            .filter((event) => event instanceof router_1.NavigationStart)
            .subscribe((event) => {
            if (event.url === '/story/edit') {
                this.activeItem = this.items[0];
            }
            else if (event.url === '/story/wiki') {
                this.activeItem = this.items[1];
            }
        });
        this.data.storyFunction = this.disableMenu();
    }
    disableMenu() {
        return (reply) => {
            for (let item of this.items) {
                item['disabled'] = false;
            }
            delete this.data.storyFunction;
        };
    }
    edit() {
        this.editing = true;
        this.prevTitle = this.data.story.story_title;
    }
    save() {
        this.editing = false;
        this.storyService.editStory(this.data.story.story_id, this.data.story.story_title);
    }
    cancel() {
        this.editing = false;
        this.data.story.story_title = this.prevTitle;
    }
};
StoryComponent = __decorate([
    core_1.Component({
        selector: 'story',
        templateUrl: './app/story/story.component.html'
    }), 
    __metadata('design:paramtypes', [router_1.Router, api_service_1.ApiService, story_service_1.StoryService, parser_service_1.ParserService])
], StoryComponent);
exports.StoryComponent = StoryComponent;
//# sourceMappingURL=story.component.js.map