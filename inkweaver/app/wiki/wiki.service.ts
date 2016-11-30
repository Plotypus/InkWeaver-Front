import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { BSON } from '../models/bson.model';
import { WebSocketService } from '../shared/websocket.service';

const url = 'ws://155.99.150.246:8080/ws';

@Injectable()
export class WikiService {
    public messages: Subject<string>;

    constructor(wsService: WebSocketService) {
        this.messages = <Subject<string>>wsService
            .connect(url).map((response: MessageEvent): string => response.data);
    }

    public createWiki(templateId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "create_wiki",
            "template_id": templateId
        }.toString());
    }

    public getAllWikis() {
        this.messages.next({
            "id": 1,
            "type": "get_all_wikis"
        }.toString());
    }

    public getWiki(wikiId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "get_wiki",
            "wiki_id": wikiId
        }.toString());
    }

    public createWikiPage(wikiId: BSON, title: string, category: string) {
        this.messages.next({
            "id": 1,
            "type": "create_wiki_page",
            "wiki_id": wikiId,
            "title": title,
            "category": category
        }.toString());
    }

    public getWikiPage(wikiPageId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "get_wiki_page",
            "wiki_page_id": wikiPageId
        }.toString());
    }
}