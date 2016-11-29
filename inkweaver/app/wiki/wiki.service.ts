import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';
import { BSON } from '../models/bson.model';

@Injectable()
export class WikiService {
    constructor(private parser: ParserService) { }

    public createWiki(templateId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "create_wiki",
            "template_id": templateId
        }.toString());
    }

    public getAllWikis() {
        this.parser.send({
            "id": 1,
            "type": "get_all_wikis"
        }.toString());
    }

    public getWiki(wikiId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "get_wiki",
            "wiki_id": wikiId
        }.toString());
    }

    public createWikiPage(wikiId: BSON, title: string, category: string) {
        this.parser.send({
            "id": 1,
            "type": "create_wiki_page",
            "wiki_id": wikiId,
            "title": title,
            "category": category
        }.toString());
    }

    public getWikiPage(wikiPageId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "get_wiki_page",
            "wiki_page_id": wikiPageId
        }.toString());
    }
}