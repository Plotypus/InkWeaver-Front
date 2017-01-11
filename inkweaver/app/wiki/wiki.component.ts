import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { MenuItem, TreeNode } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';
import { Data } from '../models/treetable-data.model';
import { PageSummary } from '../models/page-summary.model';
@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
    
})
export class WikiComponent {
    private nav: any;
    private selectedEntry: TreeNode;
    private data: any;

    constructor(private wikiService: WikiService, private parser: ParserService) {
     
        //let reply = JSON.parse(response);
        this.data = this.parser.data;
        let json = this.data.wiki;
        this.nav = new Array<Data>();
        let temp = new Data();
        temp.data = new PageSummary();
        temp.data.id = json['id'];
        temp.data.title = json['title'];
        this.nav.push(temp);
        for (let index in json['segments']) {
            this.nav.push(this.jsonToWiki(json['segments'][index]));
        }
        
    }

    public jsonToWiki(wikiJson: any) {
        let wiki = new Data();
        wiki.data = new PageSummary();
        for (let field in wikiJson) {
            if (field === "id")
                wiki.data.id = wikiJson[field];
            else if (field === "title")
                wiki.data.title = wikiJson[field];
            else if (field === "segments") {
                let segmentJsons = wikiJson[field];
                let wikiSegments = new Array<Data>();
                for (let segment in segmentJsons) {
                    var subsegment = this.jsonToWiki(segmentJsons[segment]);
                    wikiSegments.push(subsegment);
                }
                wiki.children = wikiSegments;
            }
            else if (field == "pages") {
                var pagesJsons = wikiJson[field];
                
                for (let page in pagesJsons) {
                    var leafpage = this.jsonToPage(pagesJsons[page]);
                    wiki.children.push(leafpage);
                }
               
            }
        }
        return wiki
    }

    public jsonToPage(pageJson: any) {
        let page = new Data();
        page.data = new PageSummary();
        page.data.id = pageJson['id'];
        page.data.title = pageJson['title'];
        return page;
    }
    /**
     * Selects the wiki page based on wiki navigation bar clicking
     */
    public selectWiki() {
        
        this.data.selectedPage = {'id': ''};
        this.parser.setWikiDisplay();
    }

    /**
     * Switch between pages for the wiki
     * @param page
     */
    public onSelected(page: any) {

        if (this.data.wiki.title == page.node.data.title) {
            // this.selectWiki();
            this.data.selectedPage = { 'id': '' };
            this.parser.setWikiDisplay();
        }
        else if (typeof page.node.children !== 'undefined' && page.node.children.length)
        {
            page.node.expanded = !page.node.expanded;
        }
        else {
            this.data.selectedPage = page.node.data.id;
            this.wikiService.loadWikiPageWithSections(page.node.data.id);
        }
    }

    public unsetSegment() {
        this.data.segment = new Wiki();
    }

    public setSegment(event: any) {
        this.data.segment = this.data.wiki.segments[event.index];
    }
}
