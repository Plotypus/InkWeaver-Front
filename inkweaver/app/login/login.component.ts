import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from './login.service';
import { UserService } from '../user/user.service';
import { ParserService } from '../shared/parser.service';

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
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.parserService.data;
        this.login = {
            username: '',
            password: ''
        };
    }

    public signIn() {
        this.loginService.login(this.login.username, this.login.password)
            .subscribe(response => {
                document.cookie = response.headers.get('Set-Cookie');
                console.log(document.cookie);

                this.parserService.connect();
                this.userService.getUserPreferences();
                this.userService.getUserStories();
                this.userService.getUserWikis();
                this.router.navigate(['/user']);
            });
    }
}
