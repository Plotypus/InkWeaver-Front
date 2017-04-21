import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ID } from '../../models/id.model';
import { StoryService } from '../story.service';
import { ApiService } from '../../shared/api.service';
import { ContentObject } from '../../models/story/content-object.model';

@Injectable()
export class EditService {
    constructor(private storyService: StoryService, private apiService: ApiService) { }

    // Sections
    public addSection(parentID: ID, title: string) {
        this.apiService.send({
            action: 'add_inner_subsection',
            title: title,
            parent_id: parentID
        });
    }

    public editSectionTitle(sectionID: ID, newTitle: string) {
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

    public moveSection(sectionID: ID, parentID: ID, index: number) {
        this.apiService.send({
            action: 'move_subsection_as_inner',
            section_id: sectionID,
            to_parent_id: parentID,
            to_index: index
        });
    }

    // Paragraphs
    public addParagraph(storyID: ID, sectionID: ID, text: string, succeedingParagraphID: ID) {
        text = text.replace(
            /<a href="new.+?-([a-f0-9]{24})" target="_blank">(.*?)<\/a>/g,
            '{#|' + JSON.stringify(storyID) + '|{"$$oid":"$1"}|$2|#}');

        text = text.replace(/<code>(.*?)<\/code>/g, '');

        let p: any = {
            action: 'add_paragraph',
            section_id: sectionID,
            text: text
        };
        if (succeedingParagraphID) {
            p.succeeding_paragraph_id = succeedingParagraphID
        }
        this.apiService.send(p, () => { }, { 'nocontent': text === '<br>' });
    }

    public editParagraph(storyID: ID, sectionID: ID, text: string, paragraphID: ID) {
        text = text.replace(
            /<a href="new.+?-([a-f0-9]{24})" target="_blank">(.*?)<\/a>/g,
            '{#|' + JSON.stringify(storyID) + '|{"$$oid":"$1"}|$2|#}');

        text = text.replace(
            /<a href="([a-f0-9]{24})-[a-f0-9]{24}(-(true|false))?" target="_blank"( id="(true|false)")?>.*?<\/a>/g,
            '{"$$oid":"$1"}');

        text = text.replace(/<code>(.*?)<\/code>/g, '');

        this.apiService.send({
            action: 'edit_paragraph',
            section_id: sectionID,
            update: {
                update_type: 'set_text',
                text: text
            },
            paragraph_id: paragraphID
        });
    }

    public deleteParagraph(paragraphID: ID, sectionID: ID) {
        this.apiService.send({
            action: 'delete_paragraph',
            paragraph_id: paragraphID,
            section_id: sectionID
        });
    }

    public addBookmark(sectionID: ID, paragraphID: ID, name: string, index: number) {
        this.apiService.send({
            action: 'add_bookmark',
            section_id: sectionID,
            paragraph_id: paragraphID,
            name: name, index: index
        });
    }

    public editBookmark(bookmarkID: ID, name: string) {
        this.apiService.send({
            action: 'edit_bookmark',
            bookmark_id: bookmarkID,
            update: { update_type: 'set_name', name: name }
        });
    }

    public deleteBookmark(bookmarkID: ID) {
        this.apiService.send({
            action: 'delete_bookmark',
            bookmark_id: bookmarkID
        });
    }

    public setNote(sectionID: ID, paragraphID: ID, note: string) {
        this.apiService.send({
            action: 'set_note',
            section_id: sectionID,
            paragraph_id: paragraphID,
            note: note
        });
    }

    public deleteNote(sectionID: ID, paragraphID: ID) {
        this.apiService.send({
            action: 'delete_note',
            section_id: sectionID,
            paragraph_id: paragraphID
        });
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
                this.addParagraph(storyID, sectionID, obj2[id].text, obj2[id].succeeding_paragraph_id);
            } else {
                for (let link in obj1[id].links) {
                    if (!obj2[id].links[link]) {
                        this.storyService.deleteLink(JSON.parse(link));
                    }
                }
                for (let passiveLink in obj1[id].passiveLinks) {
                    if (!obj2[id].passiveLinks[passiveLink]) {
                        this.storyService.deletePassiveLink(JSON.parse(passiveLink));
                    }
                }
                if (obj1[id].note !== obj2[id].note) {
                    if (obj2[id].note) {
                        this.setNote(sectionID, JSON.parse(id), obj2[id].note);
                    } else {
                        this.deleteNote(sectionID, JSON.parse(id));
                    }
                }
                if (obj1[id].text !== obj2[id].text) {
                    this.editParagraph(storyID, sectionID, obj2[id].text, JSON.parse(id));
                }
            }
        }
    }
}