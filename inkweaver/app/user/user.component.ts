import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { EditService } from '../story/edit/edit.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'user',
    templateUrl: './app/user/user.component.html'
})
export class UserComponent {
    private data: any;

    constructor(
        private router: Router,
        private userService: UserService,
        private editService: EditService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.parserService.data;
    }

    public selectStory(story_id: string) {
        this.editService.getStoryInformation(story_id);
        this.editService.getStoryHierarchy(story_id);
        this.router.navigate(['/story/edit']);
    }
}
