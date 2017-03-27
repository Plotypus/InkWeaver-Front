import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';

import { ApiService } from './shared/api.service';
import { UserService } from './user/user.service';

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
        private userService: UserService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            {
                label: 'Sign Out', command: (event) => {
                    this.userService.signOut();
                    this.router.navigate(['/login']);
                }
            },
            { label: 'User Page', routerLink: ['/user'] }
        ];

        let Parchment = Quill.import('parchment');
        let ID = new Parchment.Attributor.Attribute('id', 'id');
        Parchment.register(ID);
    }
}
