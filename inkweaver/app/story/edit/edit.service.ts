import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ID } from '../../models/id.model';
import { Link } from '../../models/link/link.model';
import { PassiveLink } from '../../models/link/passive-link.model';
import { Alias } from '../../models/link/alias.model';
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
        let deleted: any = {};

        // Delete paragraphs that no longer exist
        for (let id in obj1) {
            if (!obj2[id]) {
                this.deleteParagraph(JSON.parse(id), sectionID);
                for (let link in obj1[id].links) {
                    let linkObj: Link = this.apiService.data.linkTable[link];
                    if (linkObj) {
                        let aliasID: ID = linkObj.alias_id;
                        let alias: Alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                        deleted[link] = '{#|' + JSON.stringify(storyID) + '|' + JSON.stringify(alias.page_id) + '|' + alias.alias_name + '|#}';
                        this.storyService.deleteLink(JSON.parse(link));
                    }
                }
                for (let passive in obj1[id].passiveLinks) {
                    let linkObj: PassiveLink = this.apiService.data.passiveLinkTable[passive];
                    if (linkObj) {
                        let aliasID: ID = linkObj.alias_id;
                        let alias: Alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                        deleted[passive] = alias.alias_name;
                    }
                    // this.storyService.deletePassiveLink(JSON.parse(passive));
                }
            }
        }

        // Delete links and passive links
        for (let id in obj2) {
            if (!id.startsWith('new')) {
                for (let link in obj1[id].links) {
                    if (!obj2[id].links[link]) {
                        let linkObj: Link = this.apiService.data.linkTable[link];
                        if (linkObj) {
                            let aliasID: ID = linkObj.alias_id;
                            let alias: Alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                            deleted[link] = '{#|' + JSON.stringify(storyID) + '|' + JSON.stringify(alias.page_id) + '|' + alias.alias_name + '|#}';
                            this.storyService.deleteLink(JSON.parse(link));
                        }
                    }
                }
                for (let passive in obj1[id].passiveLinks) {
                    if (!obj2[id].passiveLinks[passive]) {
                        let linkObj: PassiveLink = this.apiService.data.passiveLinkTable[passive];
                        if (linkObj) {
                            let aliasID: ID = linkObj.alias_id;
                            let alias: Alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                            deleted[passive] = alias.alias_name;
                        }
                        // this.storyService.deletePassiveLink(JSON.parse(passive));
                    }
                }
            }
        }

        for (let id in obj2) {
            let edit: boolean = obj1[id] && obj1[id].text !== obj2[id].text;

            // Encode links in an acceptable format
            obj2[id].text = obj2[id].text.replace(
                /<a href="new.+?-([a-f0-9]{24})" target="_blank">(.*?)<\/a>/g,
                '{#|' + JSON.stringify(storyID) + '|{"$$oid":"$1"}|$2|#}');
            obj2[id].text = obj2[id].text.replace(
                /<a href="([a-f0-9]{24})-[a-f0-9]{24}(-(true|false))?" target="_blank"( id="(true|false)")?>.*?<\/a>/g,
                '{"$$oid":"$1"}');

            // Remove notes
            obj2[id].text = obj2[id].text.replace(/<code>.*?<\/code>/g, '');

            // If links were incorrectly deleted, put them back
            for (let dLink in deleted) {
                obj2[id].text = obj2[id].text.replace(dLink, deleted[dLink]);
            }

            if (id.startsWith('new')) {
                // Add new paragraphs
                this.addParagraph(storyID, sectionID, obj2[id].text, obj2[id].succeeding_paragraph_id);
            } else {
                // Edit existing paragraphs
                if (obj1[id] && obj1[id].note !== obj2[id].note) {
                    if (obj2[id].note) {
                        this.setNote(sectionID, JSON.parse(id), obj2[id].note);
                    } else {
                        this.deleteNote(sectionID, JSON.parse(id));
                    }
                }
                if (edit) {
                    this.editParagraph(storyID, sectionID, obj2[id].text, JSON.parse(id));
                }
            }
        }
    }
}