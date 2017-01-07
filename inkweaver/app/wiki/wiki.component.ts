import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { Wiki } from '../models/wiki.model';
import { PageSummary } from '../models/page-summary.model'
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
        this.parser.setWikiDisplay();
    }

    /**
     * Switch between pages for the wiki
     * @param page
     */
    public selectPage(page: PageSummary) {
        this.data.pageSummary = page;
        this.data.wikiSelected = false;
        this.wikiService.loadWikiPageWithSections(page.id);
    }

    public unsetSegment() {
        this.data.segment = new Wiki();
    }

    public setSegment(event: any) {
        this.data.segment = this.data.wiki.segments[event.index];
    }
}
