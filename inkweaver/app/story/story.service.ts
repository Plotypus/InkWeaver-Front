import { Injectable } from '@angular/core';

import { ApiService } from '../shared/api.service';
import { ID } from '../models/id.model';

@Injectable()
export class StoryService {
    constructor(private apiService: ApiService) { }

    // Story
    public subscribeToStory(storyID: ID) {
        this.apiService.send({
            action: 'subscribe_to_story',
            story_id: storyID
        });
    }
    public unsubscribeFromStory(storyID: ID) {
        this.apiService.send({
            action: 'unsubscribe_from_story'
        });
    }

    public addCollaborator(username: string) {
        this.apiService.send({
            action: 'add_collaborator',
            username: username
        });
    }

    public removeCollaborator(userID: ID) {
        this.apiService.send({
            action: 'remove_collaborator',
            user_id: userID
        });
    }

    public createStory(title: string, wikiID: ID, summary: string) {
        this.apiService.send({
            action: 'create_story',
            title: title,
            wiki_id: wikiID,
            summary: summary,
        });
    }

    public editStory(storyID: ID, title: string) {
        this.apiService.send({
            action: 'edit_story',
            story_id: storyID,
            update: {
                update_type: 'set_title',
                title: title
            }
        });
    }

    public deleteStory(storyID: ID) {
        this.apiService.send({
            action: 'delete_story',
            story_id: storyID
        });
    }

    // Wiki
    public subscribeToWiki(wikiID: ID) {
        this.apiService.send({
            action: 'subscribe_to_wiki',
            wiki_id: wikiID
        });
    }
    public unsubscribeFromWiki(wikiID: ID) {
        this.apiService.send({
            action: 'unsubscribe_from_wiki'
        });
    }

    // Links
    public deleteLink(linkID: ID) {
        this.apiService.send({
            action: 'delete_link',
            link_id: linkID
        });
    }
    public deletePassiveLink(linkID: ID) {
        this.apiService.send({
            action: 'delete_passive_link',
            passive_link_id: linkID
        });
    }
    public approvePassiveLink(passive_link_id: ID) {
        this.apiService.send({
            action: 'approve_passive_link',
            passive_link_id: passive_link_id
        });
    }
    public rejectPassiveLink(passive_link_id: ID) {
        this.apiService.send({
            action: 'reject_passive_link',
            passive_link_id: passive_link_id
        });
    }
}
