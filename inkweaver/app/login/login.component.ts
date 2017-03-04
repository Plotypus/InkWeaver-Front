﻿import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from './login.service';
import { UserService } from '../user/user.service';
import { ApiService } from '../shared/api.service';
import { ParserService } from '../shared/parser.service';
import { StoryService } from '../story/story.service';

@Component({
    selector: 'login',
    templateUrl: './app/login/login.component.html'
})
export class LoginComponent {
    private data: any;
    private login: any;

    constructor(
        private router: Router,
        private loginService: LoginService,
        private userService: UserService,
        private apiService: ApiService,
        private storyService: StoryService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.storyService.unsubscribeFromStory();
        this.storyService.unsubscribeFromWiki();

        this.data = this.apiService.data;
        this.data.menuItems = [{ label: 'About', routerLink: ['/about'] }];
        this.login = { username: '', password: '' };
    }

    public signIn() {
        this.loginService.login(this.login.username, this.login.password)
            .subscribe(response => {
                this.apiService.connect();
                this.userService.getUserPreferences();
                this.userService.getUserStories();
                this.userService.getUserWikis();
                this.router.navigate(['/user']);
            });

        return false;
    }
}
