import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { BSON } from '../models/bson.model';
import { WebSocketService } from '../shared/websocket.service';

const url = 'ws://155.99.150.246:8080/ws';

@Injectable()
export class SettingsService {
    public messages: Subject<string>;

    constructor(wsService: WebSocketService) {
        this.messages = <Subject<string>>wsService
            .connect(url).map((response: MessageEvent): string => response.data);
    }

    public createStory(wikiId: BSON, title: string, authors: string[], synopsis: string) {
        this.messages.next({
            "id": 1,
            "type": "create_story",
            "wiki_id": wikiId,
            "title": title,
            "authors": authors,
            "synopsis": synopsis
        }.toString());
    }

    public getStories() {
        this.messages.next({
            "id": 1,
            "type": "get_all_stories"
        }.toString());
    }

    public getStory(storyId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "get_story",
            "story_id": storyId
        }.toString());
    }
}