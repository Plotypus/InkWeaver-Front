import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';

import { UserService } from './user/user.service';
import { ApiService } from './shared/api.service';
import { WebSocketService } from './shared/websocket.service';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;
    private items: MenuItem[];

    constructor(
        private router: Router,
        private apiService: ApiService,
        private userService: UserService,
        private websocketService: WebSocketService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            {
                label: 'User Page',
                routerLink: ['/user'],
                disabled: !this.router.url.startsWith('/user') && !this.router.url.startsWith('/story')
            },
            {
                label: 'Sign Out',
                command: (event) => {
                    this.userService.signOut();
                    this.websocketService.close();
                    this.apiService.resetData();
                    this.router.navigate(['/login']);
                },
                disabled: !this.router.url.startsWith('/user') && !this.router.url.startsWith('/story')
            }
        ];

        let Parchment = Quill.import('parchment');
        let ID = new Parchment.Attributor.Attribute('id', 'id');
        let Class = new Parchment.Attributor.Attribute('class', 'class');
        Parchment.register(ID);
        Parchment.register(Class);
    }
}
