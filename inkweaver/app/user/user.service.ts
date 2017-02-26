import { Injectable } from '@angular/core';

import { ApiService } from '../shared/api.service';

@Injectable()
export class UserService {
    constructor(private apiService: ApiService) { }

    public getUserPreferences() {
        this.apiService.send({
            action: 'get_user_preferences'
        });
    }

    public getUserStories() {
        this.apiService.send({
            action: 'get_user_stories'
        });
    }

    public getUserWikis() {
        this.apiService.send({
            action: 'get_user_wikis'
        });
    }
}