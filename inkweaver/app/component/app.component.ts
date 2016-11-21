import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<nav>
                <h3>Testing Navigation</h3>
                 <a routerLink="/edit">Edit</a>
                 <a routerLink="/wiki">Wiki</a>
                 <a routerLink="/more-option">More Option</a>
               </nav>
                <router-outlet></router-outlet>
              `
})
export class AppComponent { }
