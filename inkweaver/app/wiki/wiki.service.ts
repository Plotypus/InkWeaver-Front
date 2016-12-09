import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';

@Injectable()
export class WikiService {
    constructor(private parser: ParserService) { }

    public getWikiHierarchy(id: string) {
        this.parser.send({
            "action": "get_wiki_hierarchy",
            "wiki": id
        });
    }

    public loadWikiPageWithSections(id: string) {
        this.parser.send({
            "action": "load_wiki_page_with_sections",
            "wiki_page": id
        });
    }
}