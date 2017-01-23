import { Component, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/primeng';

import { WikiService } from './wiki.service';
import { ParserService } from '../../shared/parser.service';
import { PageSummary } from '../../models/page-summary.model';

@Component({
    selector: 'wiki',
    templateUrl: './app/story/wiki/wiki.component.html'
})
export class WikiComponent {
    private data: any;
    private nav: any;
    private selectedEntry: TreeNode;
    private showAddDialog: any;
    private addOptions: any;
    private addContent: any;
    private page_name: any;
    private addTo: any;
    private wiki_page: any;

    constructor(private wikiService: WikiService, private parserService: ParserService) { }

    ngOnInit() {
        let response = `
                        {
                          "reply_to_id": 1,
                          "hierarchy": {
                            "title": "Jurassic Park Wiki",
                            "segment_id": "efg456",
                            "segments": [
                              {
                                "title": "Location",
                                "segment_id": "hji136",
                                "segments": [],
                                "pages": [
                                  {
                                    "title": "Costa Rica",
                                    "page_id": "123454321"
                                  },
                                  {
                                    "title": "Jurassic Park",
                                    "page_id": "543212345"
                                  }
                                ]
                              }
                            ],
                            "pages": []
                          }
                        }
                        `
        let reply = JSON.parse(response);
        this.data = this.parserService.data;
        //let json = this.data.wiki;
        let json = reply.hierarchy;
        this.nav = new Array<TreeNode>();
        let temp: TreeNode = {};
        temp.data = new PageSummary();
        temp.data.id = json['segment_id'];
        temp.data.title = json['title'];
        temp.label = json['title'];
        temp.type = "title"
        this.nav.push(temp);
        for (let index in json['segments']) {
            this.nav.push(this.jsonToWiki(json['segments'][index]));
        }

        this.addOptions = [];
        this.addOptions.push({ label: 'Category', value: 'category' });
        this.addOptions.push({ label: 'Page', value: 'page' });
        this.addContent = this.addOptions[0]['value'];


        response = `{
                      "reply_to_id": 1,
                      "title": "Costa Rica",
                      "aliases": [],
                      "references": [],
                      "headings": [
                        {
                          "title": "Description",
                          "text": "Costa Rica is a beautiful country.\\n\\nOr at least... it was."
                        },
                        {
                          "title": "Plot",
                          "text": "Costa Rica is a beautiful country.\\n\\nOr at least... it was."
                        },
                        {
                          "title": "Motives",
                          "text": "Costa Rica is a beautiful country.\\n\\nOr at least... it was."
                        }
                        
                      ]
                    }`;
        this.wiki_page = JSON.parse(response);


    }

    public selectPage(event: any) {
        if (event.node.leaf) {
            this.wikiService.getWikiPage(event.node.data.page_id);
        }
    }

    /**
     * Parses the Json and populates TreeNode objects so TreeTable can be used
     * @param wikiJson
     */
    public jsonToWiki(wikiJson: any) {
        let wiki: TreeNode = {};
        let parent: TreeNode = {};
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["segment_id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];

        for (let field in wikiJson) {
            if (field === "segments") {
                let segmentJsons = wikiJson[field];
                for (let segment in segmentJsons) {
                    var subsegment = this.jsonToWiki(segmentJsons[segment]);
                    parent.label = wiki.label;
                    parent.parent = wiki.parent;
                    subsegment.parent = parent;
                    wiki.children.push(subsegment);
                }

            }
            else if (field == "pages") {
                var pagesJsons = wikiJson[field];
                for (let page in pagesJsons) {
                    var leafpage = this.jsonToPage(pagesJsons[page]);
                    parent.label = wiki.label;
                    parent.parent = wiki.parent;
                    leafpage.parent = parent;
                    wiki.children.push(leafpage);
                }

            }
        }
        if (typeof wiki.children !== 'undefined' && wiki.children.length != 0) {

            wiki.type = "category";
        }
        return wiki
    }

    /**
     * Parses the Json for Pages
     * @param pageJson
     */
    public jsonToPage(pageJson: any) {
        let page: TreeNode = {};
        page.data = new PageSummary();
        page.data.id = pageJson['page_id'];
        page.data.title = pageJson['title'];
        page.label = pageJson['title'];
        page.type = "page";
        return page;
    }
    /**
     * Selects the wiki page based on wiki navigation bar clicking
     */
    public selectWiki() {
        this.data.selectedPage = { 'id': '' };
        this.parserService.setWikiDisplay();
    }

    /**
     * Switch between pages for the wiki
     * @param page
     */
    public onSelected(page: any) {

        //Take care of when the title page is clicked
        if (this.data.wiki.wiki_title == page.node.data.title) {
            this.selectWiki();
        }
        else if (page.node.type == "category") {
            page.node.expanded = !page.node.expanded;
            //get information for the page. 
        }
        else {
            this.data.selectedPage = page.node.data.id;
            this.wikiService.getWikiPage(page.node.data.id);
        }
      
    }

    /*
        Will toogle value of button variable to indicate whether something needs to be added or not
    */
    public onAdd(event:any, page: any) {
        this.addTo = page.label;
        this.showAddDialog = true;
        this.selectedEntry = page;
        event.stopPropagation();
    }
    public onDelete(event:any,page: any) {
        this.deletePage(page);
        event.stopPropagation();

    }

    public addToWiki() {
        //creating the new node to be added to the navigation
        
        this.showAddDialog = false;
        let toAdd: TreeNode = {};
        let toParent: TreeNode = {};
        toAdd.label = this.page_name;
        toAdd.data = new PageSummary();
        toAdd.data.title = this.page_name;
        toAdd.type = this.addContent;
        if (toAdd.type == 'category')
            toAdd.children = [];
        if (this.selectedEntry.type == "title") {
            this.nav.push(toAdd);
        }
        else {
            toParent.label = this.selectedEntry.label;
            toParent.parent = this.selectedEntry.parent;
            toAdd.parent = toParent;
            this.selectedEntry.children.push(toAdd);
            toAdd.data.id = { 'oid': '0' };
        }

        //need to send this info over network and get id;
        this.addContent = this.addOptions[0]['value'];
        this.page_name = "";
    }
    public deletePage(page: any) {
        //need to find location of page
        let path = Array<String>();
        let parent = page;
        while (typeof parent !== 'undefined') {
            path.push(parent.label);
            parent = parent.parent;
        }
        path = path.reverse();

        let level = 0;
        for (let index = 1; index < this.nav.length; index++) {
            if (this.findPage(this.nav[index], path, level))
                break;
        }

    }

    private findPage(search: any, path: Array<String>, index: any): boolean {
        
        if (search.label == path[index] && index != path.length - 1) {
            for (let page in search.children) {

                if (this.findPage(search.children[page], path, index + 1)) {
                    search.children.splice(page, 1);
                    return false;
                }
            }
        }
        else if (search.label == path[index] && index == path.length - 1) {
            return true;
        }
        else {
            return false;
        }
    }
}
