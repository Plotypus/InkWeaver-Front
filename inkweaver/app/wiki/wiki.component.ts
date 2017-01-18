import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { MenuItem, TreeNode } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';
import { PageSummary } from '../models/page-summary.model';
@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
    
})
export class WikiComponent {
    private nav: any;
    private selectedEntry: TreeNode;
    private data: any;
    private button: any;
    private showAddDialog: any;
    private addOptions: any;
    private addContent: any;
    private page_name: any;
    

    constructor(private wikiService: WikiService, private parser: ParserService) {
     
        //let reply = JSON.parse(response);
        this.data = this.parser.data;
        let json = this.data.wiki;
        this.nav = new Array<Data>();
        let temp = new Data();
        temp.data = new PageSummary();
        temp.data.id = json['id'];
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
    }

    /**
     * Parses the Json and populates TreeNode objects so TreeTable can be used
     * @param wikiJson
     */
    public jsonToWiki(wikiJson: any) {
        let wiki = new Data();
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];

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

    /**
     * Parses the Json for Pages
     * @param pageJson
     */
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

        //Take care of adding pages or categories to a category
        if (page.node.type == "category" && this.button == 1) {
            this.showAddDialog = true;
        }

        //Take care of when the title page is clicked
        else if (this.data.wiki.title == page.node.data.title && this.button == 0) {
            this.selectWiki();
        }
        //deletes pages 
        else if (page.node.type == "page" && this.button == -1) {
            this.deletePage(page.node);
        }
        else if (page.node.type == "category")
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

    public addToWiki()
    {
        //creating the new node to be added to the navigation
        this.showAddDialog = false;
        let toAdd: TreeNode = {};
        let toParent: TreeNode = {};
        toAdd.label = this.page_name;
        toAdd.data = new PageSummary();
        toAdd.data.title = this.page_name;
        toAdd.type = this.addContent;
        if(toAdd.type == 'category')
            toAdd.children = [];
        toParent.label = this.selectedEntry.label;
        toParent.parent = this.selectedEntry.parent;
        toAdd.parent = toParent;
        this.selectedEntry.children.push(toAdd);
        toAdd.data.id = { 'oid': '0' };

        //need to send this info over network and get id;
        this.addContent = this.addOptions[0]['value'];
        this.page_name = "";
    }
    public deletePage(page: any)
    {
        //need to find location of page
        let path = Array<String>();
        let parent = page;
        while (typeof parent !== 'undefined')
        {
            path.push(parent.label);
            parent = parent.parent;
        }
        path = path.reverse();

        let level = 0;
        for (let index in this.nav) {
            if (this.findPage(this.nav[index], path, level))
                break;
        }
        
    }

    private findPage(search: any, path: Array<String>, index: any): boolean
    {
        if (typeof search.children == 'undefined' && search.type != "page")
            return false;

        else if (search.label == path[index] && index != path.length-1)
        {
            for (let page in search.children) {
                
                if (this.findPage(search.children[page], path, index+1))
                {
                    search.children.splice(page, 1);
                    return false;
                }
            }
        }
        else if (search.label == path[index] && index == path.length-1)
        {
            return true;
        }
        else
        {
            return false;
        }
            
       
    }

}
