import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { Message } from 'primeng/primeng';

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
    private signup: boolean = false;
    private login: any = { username: '', password: '', name: '', email: '', bio: '' };

    private error: string = '';
    private growl: Message[] = [];

    constructor(
        private router: Router,
        private loginService: LoginService,
        private userService: UserService,
        private apiService: ApiService,
        private storyService: StoryService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        if (this.apiService.subscribedToStory) {
            this.storyService.unsubscribeFromStory(this.data.story.story_id);
        }
        if (this.apiService.subscribedToWiki) {
            this.storyService.unsubscribeFromWiki(this.data.story.wiki_id);
        }
        this.data.menuItems = [{ label: 'About', routerLink: ['/about'] }];
    }

    public signIn() {
        if (this.signup) {
            this.loginService.register(this.login.username, this.login.password,
                this.login.email, this.login.name, this.login.bio)
                .subscribe((response: Response) => {
                    this.signup = false;
                    this.login = { username: '', password: '', name: '', email: '', bio: '' };
                    this.growl = [{
                        severity: 'success', summary: 'Success', detail: 'You are now part of the InkWeaver team'
                    }];
                }, (error: any) => {
                    if (error.status == 409) {
                        this.error = 'Username or email already taken';
                    }
                })
        } else {
            this.loginService.login(this.login.username, this.login.password)
                .subscribe((response: Response) => {
                    this.apiService.connect();
                    this.router.navigate(['/user']);
                }, (error: any) => {
                    if (error.status == 401) {
                        this.error = 'Incorrect username or password';
                    }
                });
        }
        return false;
    }
}
