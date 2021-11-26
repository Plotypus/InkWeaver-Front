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
const login_service_1 = require('./login.service');
const user_service_1 = require('../user/user.service');
const api_service_1 = require('../shared/api.service');
const parser_service_1 = require('../shared/parser.service');
const story_service_1 = require('../story/story.service');
let LoginComponent = class LoginComponent {
    constructor(router, loginService, userService, apiService, storyService, parserService) {
        this.router = router;
        this.loginService = loginService;
        this.userService = userService;
        this.apiService = apiService;
        this.storyService = storyService;
        this.parserService = parserService;
        this.signup = false;
        this.login = { username: '', password: '', name: '', email: '', bio: '' };
        this.error = '';
        this.growl = [];
    }
    ngOnInit() {
        this.data = this.apiService.data;
        if (this.apiService.subscribedToStory) {
            this.storyService.unsubscribeFromStory(this.data.story.story_id);
        }
        if (this.apiService.subscribedToWiki) {
            this.storyService.unsubscribeFromWiki(this.data.story.wiki_id);
        }
    }
    signIn() {
        if (this.signup) {
            this.loginService.register(this.login.username, this.login.password, this.login.email, this.login.name, this.login.bio)
                .subscribe((response) => {
                this.signup = false;
                this.login = { username: '', password: '', name: '', email: '', bio: '' };
                this.growl = [{
                        severity: 'success', summary: 'Success', detail: 'You are now part of the InkWeaver team'
                    }];
            }, (error) => {
                if (error.status == 409) {
                    this.error = 'Username or email already taken';
                }
            });
        }
        else {
            this.loginService.login(this.login.username, this.login.password)
                .subscribe((response) => {
                this.apiService.connect();
                this.router.navigate(['/user']);
            }, (error) => {
                if (error.status == 401) {
                    this.error = 'Incorrect username or password';
                }
            });
        }
        return false;
    }
};
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login',
        templateUrl: './app/login/login.component.html'
    }), 
    __metadata('design:paramtypes', [router_1.Router, login_service_1.LoginService, user_service_1.UserService, api_service_1.ApiService, story_service_1.StoryService, parser_service_1.ParserService])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map