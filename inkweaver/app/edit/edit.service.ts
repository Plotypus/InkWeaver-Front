import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';
import { BSON } from '../models/bson.model';

@Injectable()
export class EditService {
    constructor(private parser: ParserService) { }

    // -------------------- PARAGRAPH -------------------- //
    public createParagraph(chapId: BSON, precId: BSON, succId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "create_paragraph",
            "chapter_id": chapId,
            "preceding_id": precId,
            "succeeding_id": succId
        }.toString());
    }

    public getParagraph(pid: BSON) {
        this.parser.send({
            "id": 1,
            "type": "get_paragraph",
            "paragraph_id": pid
        }.toString());
    }

    // -------------------- CHAPTER -------------------- //
    public createChapter(storyId: BSON, title: string) {
        this.parser.send({
            "id": 1,
            "type": "create_chapter",
            "story_id": storyId,
            "title": title
        }.toString());
    }

    public getChapter(chapId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "get_chapter",
            "chapter_id": chapId
        }.toString());
    }
}