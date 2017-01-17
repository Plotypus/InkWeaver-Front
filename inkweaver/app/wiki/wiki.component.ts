import { Component } from '@angular/core';

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
    private button: any;

    constructor(private wikiService: WikiService, private parser: ParserService) {
        
        //let reply = JSON.parse(response);
        this.data = this.parser.data;
        let json = this.data.wiki;
        this.nav = new Array<TreeNode>();
        let temp : TreeNode = {};
        temp.data = new PageSummary();
        temp.data.id = json['id'];
        temp.data.title = json['title'];
        temp.label = json['title'];
        temp.type = "category"
        this.nav.push(temp);
        for (let index in json['segments']) {
            this.nav.push(this.jsonToWiki(json['segments'][index]));
        }
        
    }

    public jsonToWiki(wikiJson: any) {
        let wiki: TreeNode = {};
        let parent: TreeNode = {};
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["id"];
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
        if (typeof wiki.children !== 'undefined' && wiki.children.length != 0)
        {
          
           wiki.type = "category";
        }
        return wiki
    }

    public jsonToPage(pageJson: any) {
        let page: TreeNode = {};
        page.data = new PageSummary();
        page.data.id = pageJson['id'];
        page.data.title = pageJson['title'];
        page.label = pageJson['title'];
        page.type = "page";
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
        else if (page.node.type == "category" && this.button == 1)
        {

        }
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
        this.button = 0;
    }

    /*
        Will toogle value of button variable to indicate whether something needs to be added or not
    */
    public onAdd(page: any)
    {
        this.button = 1;
    }
    public onDelete(page: any)
    {
        this.button = -1;
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
        if (typeof search.children == 'undefined')
            return false;

        else if (search.label == path[index] && index != path.length-1)
        {
            for (let page in search.children) {
                
                if (this.findPage(search.children[page], path, index+1))
                {
                    search.children.splice(page, 1);
                    return true;
                }
            }
        }
        else if (search.label == path[index] && index == path.length-1)
        {
            return true;
        }
        else
        {
           
        }
            
       
    }

}
