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
const api_service_1 = require('../shared/api.service');
let StoryService = class StoryService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    subscribeToStory(storyID) {
        this.apiService.send({
            action: 'subscribe_to_story',
            story_id: storyID
        });
    }
    unsubscribeFromStory(storyID) {
        this.apiService.send({
            action: 'unsubscribe_from_story'
        });
    }
    addCollaborator(storyID, username) {
        this.apiService.send({
            action: 'add_story_collaborator',
            story_id: storyID,
            username: username
        });
    }
    removeCollaborator(storyID, userID) {
        this.apiService.send({
            action: 'remove_story_collaborator',
            story_id: storyID,
            user_id: userID
        });
    }
    createStory(title, wikiID, summary) {
        this.apiService.send({
            action: 'create_story',
            title: title,
            wiki_id: wikiID,
            summary: summary,
        });
    }
    editStory(storyID, title) {
        this.apiService.send({
            action: 'edit_story',
            story_id: storyID,
            update: {
                update_type: 'set_title',
                title: title
            }
        });
    }
    deleteStory(storyID) {
        this.apiService.send({
            action: 'delete_story',
            story_id: storyID
        });
    }
    subscribeToWiki(wikiID) {
        this.apiService.send({
            action: 'subscribe_to_wiki',
            wiki_id: wikiID
        });
    }
    unsubscribeFromWiki(wikiID) {
        this.apiService.send({
            action: 'unsubscribe_from_wiki'
        });
    }
    deleteLink(linkID) {
        this.apiService.send({
            action: 'delete_link',
            link_id: linkID
        });
    }
    deletePassiveLink(linkID) {
        this.apiService.send({
            action: 'delete_passive_link',
            passive_link_id: linkID
        });
    }
    approvePassiveLink(passive_link_id) {
        this.apiService.send({
            action: 'approve_passive_link',
            passive_link_id: passive_link_id
        });
    }
    rejectPassiveLink(passive_link_id) {
        this.apiService.send({
            action: 'reject_passive_link',
            passive_link_id: passive_link_id
        });
    }
};
StoryService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [api_service_1.ApiService])
], StoryService);
exports.StoryService = StoryService;
//# sourceMappingURL=story.service.js.map