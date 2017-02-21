import { Injectable } from '@angular/core';

import { ApiService } from '../shared/api.service';
import { ID } from '../models/id.model';

@Injectable()
export class StoryService {
    constructor(private apiService: ApiService) { }

    // Story
    public createStory(title: string, wikiID: ID, summary: string) {
        this.apiService.send({
            action: 'create_story',
            title: title,
            wiki_id: wikiID,
            summary: summary,
        });
    }

    public deleteStory(storyID: ID) {
        this.apiService.send({
            action: 'delete_story',
            story_id: storyID
        });
    }

    public getStoryInformation(storyID: ID) {
        this.apiService.send({
            action: 'get_story_information',
            story_id: storyID
        });
    }

    public getStoryHierarchy(storyID: ID) {
        this.apiService.send({
            action: 'get_story_hierarchy',
            story_id: storyID
        });
    }

    public getSectionHierarchy(sectionID: ID) {
        this.apiService.send({
            action: 'get_section_hierarchy',
            section_id: sectionID
        });
    }

    // Links
    public createLink(storyID: ID, sectionID: ID, paragraphID: ID, name: string, pageID: ID, callback: any) {
        this.apiService.send({
            action: 'create_link',
            story_id: storyID,
            section_id: sectionID,
            paragraph_id: paragraphID,
            name: name,
            page_id: pageID
        }, callback);
    }

    public deleteLink(linkID: ID) {
        this.apiService.send({
            action: 'delete_link',
            link_id: linkID,
        });
    }
}