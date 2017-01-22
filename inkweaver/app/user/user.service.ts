import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';

@Injectable()
export class UserService {
    constructor(private parserService: ParserService) { }

    public getUserPreferences() {
        this.parserService.send({
            action: 'get_user_preferences'
        });
    }

    public getUserStories() {
        this.parserService.send({
            action: 'get_user_stories'
        });
    }

    public getUserWikis() {
        this.parserService.send({
            action: 'get_user_wikis'
        });
    }
}