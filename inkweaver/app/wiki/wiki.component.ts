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
    private data: any;
    private selectedEntry: TreeNode;

    constructor(private wikiService: WikiService, private parser: ParserService) {
       
        let response = `{"reply_to": 1,
  "hierarchy": {
    "title": "My Wiki",
    "id": {"$oid": 1},
    "segments": [
      {
        "title": "Character",
        "id": {"$oid":2},
        "segments": [
          {
              "title": " Sub Character",
              "id": {"$oid":2},
              "segments": [],
              "pages": [
              {
                 "title": "Alice",
                 "id": {"$oid":3}
              }]
          }
        ],
         "pages": [
              {
                 "title": "John",
                 "id": {"$oid":4}
              },
              {
                 "title": "Blake",
                 "id": {"$oid":5}
              }]
      },
      {
        "title": "Location",
        "id": {"$oid":2},
        "segments": [],
        "pages": [
          {
                 "title": "John Home",
                 "id": {"$oid":6}
              },
              {
                 "title": "Blake Home",
                 "id": {"$oid":7}
              }]
      }
    ],
    "pages": [
      {
        "title": "Uncategorized Wiki Page",
        "id": {"$oid":8}
      }
    ]
  }
}`;

       /* let test = new Array<Data>();
        let temp = new Data();
        temp.data = new PageSummary();
        temp.data.id = "hi";
        temp.data.title = "Title";
        temp.children = [];
        test.push(temp);
        test.push(temp);
        temp.children = new Array<Data>();
        temp.data.title = "Chapter 1";
        test.push(temp);
        this.data = test;
        */
        let reply = JSON.parse(response);
        let json = reply.hierarchy
        this.data = new Array<Data>();
        let temp = new Data();
        temp.data = new PageSummary();
        temp.data.id = json['id'];
        temp.data.title = json['title'];
        this.data.push(temp);
        for (let index in json['segments']) {
            this.data.push(this.jsonToWiki(json['segments'][index]));

        }
        /*
        response = `{
    "data":
    [  {
            "data": {
                "name":"Title"
                    },
            "children":[]
        },
        {  
            "data":{  
                "name":"Documents"
                
            },
            "children":[
                        {
                            "data":{
                                "name":"Nested"
                                   }
                            
                        }
                       ]
        },
 {  
            "data":{  
                "name":"People",
                "size":"75kb",
                "type":"Folder"
            },
            "children":[
                        {
                            "data":{
                                "name":"Nested"
                                   }
                            
                        }
                       ]
        }
  
    ]
}
            `;*/
        //let reply = JSON.parse(response);
       
       // this.parser.data.wiki = reply.data;
      //  this.data = reply.data;
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
        this.data.wikiSelected = true;
        this.data.selectedPage = {'id': ''};
        this.parser.setWikiDisplay();
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
