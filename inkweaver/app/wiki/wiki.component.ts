import { Component } from '@angular/core';

import { MenuItem } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
})
export class WikiComponent {
    private data: any;

    constructor(private wikiService: WikiService, private parser: ParserService) {
        this.data = this.parser.data;
    }
    /**
     * Selects the wiki page based on wiki navigation bar clicking
     */
    public selectWiki() {
        this.data.wikiSelected = true;
        this.data.selectedPage = {'id': ''};
    }

    /**
     * Switch between pages for the wiki
     * @param page
     */
    public switchPage(page: any) {
        this.data.wikiSelected = false;
        this.data.selectedPage = page;
        this.wikiService.loadWikiPageWithSections(page.id);
    }
}
