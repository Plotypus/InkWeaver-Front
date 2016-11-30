import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { BSON } from '../models/bson.model';
import { WebSocketService } from '../shared/websocket.service';

const url = 'ws://155.99.150.246:8080/ws';

@Injectable()
export class EditService {
    public messages: Subject<string>;

    constructor(wsService: WebSocketService) {
        this.messages = <Subject<string>>wsService
            .connect(url).map((response: MessageEvent): string => response.data);
    }

    // -------------------- PARAGRAPH -------------------- //
    public createParagraph(chapId: BSON, precId: BSON, succId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "create_paragraph",
            "chapter_id": chapId,
            "preceding_id": precId,
            "succeeding_id": succId
        }.toString());
    }

    public getParagraph(pid: BSON) {
        this.messages.next({
            "id": 1,
            "type": "get_paragraph",
            "paragraph_id": pid
        }.toString());
    }

    // -------------------- CHAPTER -------------------- //
    public createChapter(storyId: BSON, title: string) {
        this.messages.next({
            "id": 1,
            "type": "create_chapter",
            "story_id": storyId,
            "title": title
        }.toString());
    }

    public getChapter(chapId: BSON) {
        this.messages.next({
            "id": 1,
            "type": "get_chapter",
            "chapter_id": chapId
        }.toString());
    }
}