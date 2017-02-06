import { Injectable } from '@angular/core';

import { ID } from '../../models/id.model';
import { StoryService } from '../story.service';
import { ApiService } from '../../shared/api.service';
import { ContentObject } from '../../models/story/content-object.model';

@Injectable()
export class EditService {
    constructor(private storyService: StoryService, private apiService: ApiService) { }

    public createStory(title: string, wiki_id: string, summary: string) {
        this.apiService.send({
            action: 'create_story',
            title: title,
            wiki_id: wiki_id,
            summary: summary,
        });
    }

    public addParagraph(section_id: ID, text: string, succeeding_paragraph_id: ID, callback: any) {
        let p: any = {
            action: 'add_paragraph',
            section_id: section_id,
            text: text
        };
        if (succeeding_paragraph_id) {
            p.succeeding_paragraph_id = succeeding_paragraph_id
        }
        this.apiService.send(p, callback);
    }

    public editParagraph(section_id: ID, text: string, paragraph_id: ID) {
        text = text.replace(
            /<a href="([a-z0-9]{24})-([a-z0-9]{24})" target="_blank">(.*?)<\/a>/g,
            '{"$$oid":"$1"}');

        this.apiService.send({
            action: 'edit_paragraph',
            section_id: section_id,
            update: {
                update_type: 'set_text',
                text: text
            },
            paragraph_id: paragraph_id
        });
    }

    public deleteParagraph(paragraph_id: ID) {
        this.apiService.send({
            action: 'delete_paragraph',
            paragraph_id: paragraph_id
        });
    }

    public getStoryInformation(story_id: ID) {
        this.apiService.send({
            action: 'get_story_information',
            story_id: story_id
        });
    }

    public getStoryHierarchy(story_id: ID) {
        this.apiService.send({
            action: 'get_story_hierarchy',
            story_id: story_id
        });
    }

    public getSectionHierarchy(section_id: ID) {
        this.apiService.send({
            action: 'get_section_hierarchy',
            section_id: section_id
        });
    }

    public getSectionContent(section_id: ID) {
        this.apiService.send({
            action: 'get_section_content',
            section_id: section_id
        });
    }

    /* -------------------- Helper methods -------------------- */

    public compare(obj1: ContentObject, obj2: ContentObject, story_id: ID, section_id: ID) {
        // Delete paragraphs that no longer exist
        for (let id in obj1) {
            if (!obj2[id]) {
                this.deleteParagraph(JSON.parse(id));
                for (let link in obj1[id].links) {
                    this.storyService.deleteLink(JSON.parse(link));
                }
            }
        }

        // Edit existing paragraphs
        for (let id in obj2) {
            if (id.startsWith('new')) {
                this.addParagraph(
                    section_id, obj2[id].text, obj2[id].succeeding_id, (reply1: any) => {
                        for (let link in obj2[id].links) {
                            this.storyService.createLink(story_id, section_id,
                                reply1.paragraph_id, obj2[id].links[link].name,
                                obj2[id].links[link].page_id, (reply2) => {
                                    let newText: string = obj2[id].text.replace(
                                        link, reply2.link_id.$oid);
                                    this.editParagraph(section_id, newText, reply1.paragraph_id);
                                });
                        }
                    });
            } else {
                if (obj1[id].text != obj2[id].text) {
                    this.editParagraph(section_id, obj2[id].text, JSON.parse(id));

                    // Links
                    for (let link in obj1[id].links) {
                        if (!obj2[id].links[link]) {
                            this.storyService.deleteLink(JSON.parse(link));
                        }
                    }
                    for (let link in obj2[id].links) {
                        if (link.startsWith('new')) {
                            this.storyService.createLink(story_id, section_id, JSON.parse(id),
                                obj2[id].links[link].name, obj2[id].links[link].page_id, (reply) => {
                                    let newText: string = obj2[id].text.replace(
                                        link, reply.link_id.$oid);
                                    this.editParagraph(section_id, newText, JSON.parse(id));
                                });
                        }
                    }
                }
            }
        }
    }
}