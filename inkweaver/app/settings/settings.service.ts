import { Injectable } from '@angular/core';

import { BSON } from '../models/bson.model';
import { ParserService } from '../shared/parser.service';

@Injectable()
export class SettingsService {
    constructor(private parser: ParserService) { }

    public createStory(wikiId: BSON, title: string, authors: string[], synopsis: string) {
        this.parser.send({
            "id": 1,
            "type": "create_story",
            "wiki_id": wikiId,
            "title": title,
            "authors": authors,
            "synopsis": synopsis
        }.toString());
    }

    public getStories() {
        this.parser.send({
            "id": 1,
            "type": "get_all_stories"
        }.toString());
    }

    public getStory(storyId: BSON) {
        this.parser.send({
            "id": 1,
            "type": "get_story",
            "story_id": storyId
        }.toString());
    }
}