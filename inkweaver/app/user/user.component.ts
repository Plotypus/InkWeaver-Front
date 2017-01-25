import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from 'primeng/primeng';

import { UserService } from './user.service';
import { EditService } from '../story/edit/edit.service';
import { WikiService } from '../story/wiki/wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'user',
    templateUrl: './app/user/user.component.html'
})
export class UserComponent {
    private data: any;
    private colors: string[];

    constructor(
        private router: Router,
        private userService: UserService,
        private editService: EditService,
        private wikiService: WikiService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.parserService.data;
        this.colors = [
            "#b0c9dd", // light blue
            "#fdd17c", // yellow
            "#74b0b8", // muted blue
            "#acd8b4", // pastel green
            "#903737", // maroon
            "#8779c3", // purple
            "#8c744e", // brown
            "#cb735c", // red-orange
            "#4d6b61"  // green
        ];
    }

    public selectStory(story_id: string) {
        this.editService.getStoryInformation(story_id);
        this.editService.getStoryHierarchy(story_id);
        this.router.navigate(['/story/edit']);
    }

    public randomColor(title: string) {
        return this.colors[title.length % this.colors.length];
    }
}
