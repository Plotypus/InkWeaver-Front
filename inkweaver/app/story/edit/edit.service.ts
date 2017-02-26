import { Injectable } from '@angular/core';

import { ID } from '../../models/id.model';
import { StoryService } from '../story.service';
import { ApiService } from '../../shared/api.service';
import { ContentObject } from '../../models/story/content-object.model';

@Injectable()
export class EditService {
    constructor(private storyService: StoryService, private apiService: ApiService) { }

    // Sections
    public addSection(title: string, parentID: ID) {
        this.apiService.send({
            action: 'add_inner_subsection',
            title: title,
            parent_id: parentID
        });
    }

    public editSectionTitle(newTitle: string, sectionID: ID) {
        this.apiService.send({
            action: 'edit_section_title',
            section_id: sectionID,
            new_title: newTitle
        });
    }

    public deleteSection(sectionId: ID) {
        this.apiService.send({
            action: 'delete_section',
            section_id: sectionId
        });
    }

    // Paragraphs
    public addParagraph(sectionID: ID, text: string, succeedingParagraphID: ID, callback: any) {
        let p: any = {
            action: 'add_paragraph',
            section_id: sectionID,
            text: text
        };
        if (succeedingParagraphID) {
            p.succeeding_paragraph_id = succeedingParagraphID
        }
        this.apiService.send(p, callback, { noflight: true });
    }

    public editParagraph(sectionID: ID, text: string, paragraphID: ID) {
        text = text.replace(
            /<a href="([a-z0-9]{24})-([a-z0-9]{24})" target="_blank">(.*?)<\/a>/g,
            '{"$$oid":"$1"}');

        this.apiService.send({
            action: 'edit_paragraph',
            section_id: sectionID,
            update: {
                update_type: 'set_text',
                text: text
            },
            paragraph_id: paragraphID
        }, (reply: any) => { }, { noflight: true });
    }

    public deleteParagraph(paragraphID: ID, sectionID: ID) {
        this.apiService.send({
            action: 'delete_paragraph',
            paragraph_id: paragraphID,
            section_id: sectionID
        }, (reply: any) => { }, { noflight: true });
    }

    public getSectionContent(sectionID: ID, sectionTitle: string, paraID: any = "") {
        this.apiService.refreshContent(sectionID, sectionTitle,paraID);
    }

    /**
     * Makes the appropriate calls to save changes between the
     * previous state of the story (obj1) and the new state (obj2)
     * @param obj1
     * @param obj2
     * @param storyID
     * @param sectionID
     */
    public compare(obj1: ContentObject, obj2: ContentObject, storyID: ID, sectionID: ID) {
        // Delete paragraphs that no longer exist
        for (let id in obj1) {
            if (!obj2[id]) {
                this.deleteParagraph(JSON.parse(id), sectionID);
                for (let link in obj1[id].links) {
                    this.storyService.deleteLink(JSON.parse(link));
                }
            }
        }

        // Edit existing paragraphs
        for (let id in obj2) {
            if (id.startsWith('new')) {
                this.addParagraph(
                    sectionID, obj2[id].text, obj2[id].succeeding_id, (reply1: any) => {
                        for (let link in obj2[id].links) {
                            this.storyService.createLink(storyID, sectionID,
                                reply1.paragraph_id, obj2[id].links[link].name,
                                obj2[id].links[link].page_id, (reply2) => {
                                    this.apiService.data.linkTable[JSON.stringify(reply2.link_id)] = {
                                        page_id: obj2[id].links[link].page_id,
                                        name: obj2[id].links[link].name
                                    };

                                    let newText: string = obj2[id].text.replace(
                                        link, reply2.link_id.$oid);
                                    this.editParagraph(sectionID, newText, reply1.paragraph_id);
                                });
                        }
                    });
            } else {
                if (obj1[id].text != obj2[id].text) {
                    this.editParagraph(sectionID, obj2[id].text, JSON.parse(id));

                    // Links
                    for (let link in obj1[id].links) {
                        if (!obj2[id].links[link]) {
                            this.storyService.deleteLink(JSON.parse(link));
                        }
                    }
                    for (let link in obj2[id].links) {
                        if (link.startsWith('new')) {
                            this.storyService.createLink(storyID, sectionID, JSON.parse(id),
                                obj2[id].links[link].name, obj2[id].links[link].page_id, (reply) => {
                                    this.apiService.data.linkTable[JSON.stringify(reply.link_id)] = {
                                        page_id: obj2[id].links[link].page_id,
                                        name: obj2[id].links[link].name
                                    };

                                    let newText: string = obj2[id].text.replace(
                                        link, reply.link_id.$oid);
                                    this.editParagraph(sectionID, newText, JSON.parse(id));
                                });
                        }
                    }
                }
            }
        }
    }
}