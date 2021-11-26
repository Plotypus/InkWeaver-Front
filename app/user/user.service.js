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
let UserService = class UserService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    getUserPreferences() {
        this.apiService.send({
            action: 'get_user_preferences'
        });
    }
    getUserStoriesAndWikis() {
        this.apiService.send({
            action: 'get_user_stories_and_wikis'
        });
    }
    setUserName(name) {
        this.apiService.send({
            action: 'set_user_name',
            name: name
        });
    }
    setUserEmail(email) {
        this.apiService.send({
            action: 'set_user_email',
            email: email
        });
    }
    setUserBio(bio) {
        this.apiService.send({
            action: 'set_user_bio',
            bio: bio
        });
    }
    setUserAvatar(avatar) {
        this.apiService.send({
            action: 'set_user_avatar',
            avatar: avatar
        });
    }
    setUserStoryPositionContext(sectionID, paragraphID) {
        this.apiService.send({
            action: 'set_user_story_position_context',
            position_context: { section_id: sectionID, paragraph_id: paragraphID }
        });
    }
    signOut() {
        this.apiService.send({
            action: 'sign_out'
        });
    }
};
UserService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [api_service_1.ApiService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map