import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';

@Injectable()
export class WikiService {
    constructor(private parser: ParserService) { }

    //get the wiki hierarchy which has ideas for each page and 
    //the list of all the categories
    public getWikiHierarchy(id: any) {
        this.parser.send({
            "action": "get_wiki_hierarchy",
            "wiki": id
        });
    }

    //Given an id you will get the content for the given page. 
    public loadWikiPageWithSections(id: any) {
        this.parser.send({
            "action": "load_wiki_page_with_sections",
            "wiki_page": id
        });
    }
}