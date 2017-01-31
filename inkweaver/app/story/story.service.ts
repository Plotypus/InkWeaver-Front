import { Injectable } from '@angular/core';

import { ApiService } from '../shared/api.service';

@Injectable()
export class StoryService {
    constructor(private apiService: ApiService) { }

    public createLink(story_id: string, section_id: string, paragraph_id: string, name: string, page_id: string) {
        this.apiService.send({
            action: 'create_link',
            story_id: story_id,
            section_id: section_id,
            paragraph_id: paragraph_id,
            name: name,
            page_id: page_id
        });
    }
}