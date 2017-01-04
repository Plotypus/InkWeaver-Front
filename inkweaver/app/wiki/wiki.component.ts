import { Component } from '@angular/core';

import { MenuItem, TreeNode } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
    
})
export class WikiComponent {
    private data: any;

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

        response = `{
    "data":
    [  
        {  
            "data":{  
                "name":"Documents",
                
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
            `;
        let reply = JSON.parse(response);
       
        this.parser.data.wiki = reply.data;
        this.data = reply.data;
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
