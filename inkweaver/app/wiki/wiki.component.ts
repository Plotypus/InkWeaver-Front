import { Component } from '@angular/core';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
})
export class WikiComponent {
    private replies: string[];

    constructor(private wikiService: WikiService, private parser: ParserService) {
        this.replies = this.parser.replies;
    }
}
