import { Injectable } from '@angular/core';

import { ApiService } from '../shared/api.service';
import { ID } from '../models/id.model';

@Injectable()
export class StoryService {
    constructor(private apiService: ApiService) { }

    public createLink(story_id: ID, section_id: ID, paragraph_id: ID, name: string, page_id: ID, callback: any) {
        this.apiService.send({
            action: 'create_link',
            story_id: story_id,
            section_id: section_id,
            paragraph_id: paragraph_id,
            name: name,
            page_id: page_id
        }, callback);
    }

    public deleteLink(link_id: ID) {
        this.apiService.send({
            action: 'delete_link',
            link_id: link_id,
        });
    }
}