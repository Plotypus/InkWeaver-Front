import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class EditService {
    constructor(private apiService: ApiService) { }

    public createStory(title: string, wiki_id: string, summary: string) {
        this.apiService.send({
            action: 'create_story',
            title: title,
            wiki_id: wiki_id,
            summary: summary,
        });
    }

    public addParagraph(section_id: string, text: string, succeeding_paragraph_id: string) {
        let p: any = {
            action: 'add_paragraph',
            section_id: section_id,
            text: text
        };
        if (succeeding_paragraph_id) {
            p.succeeding_paragraph_id = succeeding_paragraph_id
        }
        this.apiService.send(p);
    }

    public editParagraph(section_id: string, text: string, paragraph_id: string) {
        this.apiService.send({
            action: 'add_paragraph',
            section_id: section_id,
            update: {
                update_type: 'set_text',
                text: text
            },
            paragraph_id: paragraph_id
        });
    }

    public getStoryInformation(story_id: string) {
        this.apiService.send({
            action: 'get_story_information',
            story_id: story_id
        });
    }

    public getStoryHierarchy(story_id: string) {
        this.apiService.send({
            action: 'get_story_hierarchy',
            story_id: story_id
        });
    }

    public getSectionHierarchy(section_id: string) {
        this.apiService.send({
            action: 'get_section_hierarchy',
            section_id: section_id
        });
    }

    public getSectionContent(section_id: string) {
        this.apiService.send({
            action: 'get_section_content',
            section_id: section_id
        });
    }

    /* -------------------- Helper methods -------------------- */

    public compare(obj1: any, obj2: any, section_id: string) {
        // Delete paragraphs that no longer exist
        for (let id of obj1) {
            if (!obj2[id]) {
                console.log('Delete paragraph ' + id);
                for (let link of obj1[id].links) {
                    console.log('Delete link ' + link.id);
                }
            }
        }

        // Edit existing paragraphs
        for (let id in obj2) {
            this.editParagraph(section_id, obj2[id].text, obj2[id].id);

            // Links
            let i: number = obj1[id].links.length;
            while (i--) {
                let j: number = obj2[id].links.length;
                while (j--) {
                    if (obj1[id].links[i].id == obj2[id].links[j].id &&
                        obj1[id].links[i].text == obj2[id].links[j].text) {
                        obj1[id].links = obj1[id].links.splice(i, 1);
                        obj2[id].links = obj2[id].links.splice(j, 1);
                    }
                }
            }
            for (let i = 0; i < obj1[id].links.length; i++) {
                console.log('Delete link ' + obj1[id].links[i].id);
            }
            for (let i = 0; i < obj2[id].links.length; i++) {
                console.log('Add link ' + obj2[id].links[i].id)
            }
        }

        // Add new paragraphs
        for (let p of obj2.add) {
            this.addParagraph(section_id, p.text, p.succeeding_paragraph_id);
            for (let i = 0; i < p.links.length; i++) {
                console.log('Add link ' + p.links[i].id);
            }
        }
    }
}