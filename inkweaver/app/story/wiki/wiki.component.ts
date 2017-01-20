import { Component, OnInit } from '@angular/core';

import { WikiService } from './wiki.service';
import { ParserService } from '../../shared/parser.service';

@Component({
    selector: 'wiki',
    templateUrl: './app/story/wiki/wiki.component.html'

})
export class WikiComponent {
    private data: any;

    constructor(
        private wikiService: WikiService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.parserService.data;
    }

    public selectPage(event: any) {
        if (event.node.leaf) {
            this.wikiService.getWikiPage(event.node.data.page_id);
        }
    }
}
