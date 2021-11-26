"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const story_service_1 = require('../story.service');
const api_service_1 = require('../../shared/api.service');
let EditService = class EditService {
    constructor(storyService, apiService) {
        this.storyService = storyService;
        this.apiService = apiService;
    }
    addSection(parentID, title) {
        this.apiService.send({
            action: 'add_inner_subsection',
            title: title,
            parent_id: parentID
        });
    }
    editSectionTitle(sectionID, newTitle) {
        this.apiService.send({
            action: 'edit_section_title',
            section_id: sectionID,
            new_title: newTitle
        });
    }
    deleteSection(sectionId) {
        this.apiService.send({
            action: 'delete_section',
            section_id: sectionId
        });
    }
    moveSection(sectionID, parentID, index) {
        this.apiService.send({
            action: 'move_subsection_as_inner',
            section_id: sectionID,
            to_parent_id: parentID,
            to_index: index
        });
    }
    addParagraph(storyID, sectionID, text, succeedingParagraphID) {
        let p = {
            action: 'add_paragraph',
            section_id: sectionID,
            text: text
        };
        if (succeedingParagraphID) {
            p.succeeding_paragraph_id = succeedingParagraphID;
        }
        this.apiService.send(p, () => { }, { 'nocontent': text === '<br>' });
    }
    editParagraph(storyID, sectionID, text, paragraphID) {
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
    deleteParagraph(paragraphID, sectionID) {
        this.apiService.send({
            action: 'delete_paragraph',
            paragraph_id: paragraphID,
            section_id: sectionID
        });
    }
    addBookmark(sectionID, paragraphID, name, index) {
        this.apiService.send({
            action: 'add_bookmark',
            section_id: sectionID,
            paragraph_id: paragraphID,
            name: name, index: index
        });
    }
    editBookmark(bookmarkID, name) {
        this.apiService.send({
            action: 'edit_bookmark',
            bookmark_id: bookmarkID,
            update: { update_type: 'set_name', name: name }
        });
    }
    deleteBookmark(bookmarkID) {
        this.apiService.send({
            action: 'delete_bookmark',
            bookmark_id: bookmarkID
        });
    }
    setNote(sectionID, paragraphID, note) {
        this.apiService.send({
            action: 'set_note',
            section_id: sectionID,
            paragraph_id: paragraphID,
            note: note
        });
    }
    deleteNote(sectionID, paragraphID) {
        this.apiService.send({
            action: 'delete_note',
            section_id: sectionID,
            paragraph_id: paragraphID
        });
    }
    compare(obj1, obj2, storyID, sectionID) {
        let deleted = {};
        for (let id in obj1) {
            if (!obj2[id]) {
                this.deleteParagraph(JSON.parse(id), sectionID);
                for (let link in obj1[id].links) {
                    let linkObj = this.apiService.data.linkTable[link];
                    if (linkObj) {
                        let aliasID = linkObj.alias_id;
                        let alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                        deleted[link] = '{#|' + JSON.stringify(storyID) + '|' + JSON.stringify(alias.page_id) + '|' + alias.alias_name + '|#}';
                        this.storyService.deleteLink(JSON.parse(link));
                    }
                }
                for (let passive in obj1[id].passiveLinks) {
                    let linkObj = this.apiService.data.passiveLinkTable[passive];
                    if (linkObj) {
                        let aliasID = linkObj.alias_id;
                        let alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                        deleted[passive] = alias.alias_name;
                    }
                }
            }
        }
        for (let id in obj2) {
            if (!id.startsWith('new') && obj1[id]) {
                for (let link in obj1[id].links) {
                    if (!obj2[id].links[link]) {
                        let linkObj = this.apiService.data.linkTable[link];
                        if (linkObj) {
                            let aliasID = linkObj.alias_id;
                            let alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                            deleted[link] = '{#|' + JSON.stringify(storyID) + '|' + JSON.stringify(alias.page_id) + '|' + alias.alias_name + '|#}';
                            this.storyService.deleteLink(JSON.parse(link));
                        }
                    }
                }
                for (let passive in obj1[id].passiveLinks) {
                    if (!obj2[id].passiveLinks[passive]) {
                        let linkObj = this.apiService.data.passiveLinkTable[passive];
                        if (linkObj) {
                            let aliasID = linkObj.alias_id;
                            let alias = this.apiService.data.aliasTable[JSON.stringify(aliasID)];
                            deleted[passive] = alias.alias_name;
                        }
                    }
                }
            }
        }
        for (let id in obj2) {
            let edit = obj1[id] && obj1[id].text !== obj2[id].text;
            obj2[id].text = obj2[id].text.replace(/<a href="new.+?-([a-f0-9]{24})" target="_blank">(.*?)<\/a>/g, '{#|' + JSON.stringify(storyID) + '|{"$$oid":"$1"}|$2|#}');
            obj2[id].text = obj2[id].text.replace(/<a href="([a-f0-9]{24})-[a-f0-9]{24}(-(true|false))?" target="_blank"( id="(true|false)")?>.*?<\/a>/g, '{"$$oid":"$1"}');
            obj2[id].text = obj2[id].text.replace(/<code>.*?<\/code>/g, '');
            for (let dLink in deleted) {
                obj2[id].text = obj2[id].text.replace(dLink, deleted[dLink]);
            }
            if (id.startsWith('new')) {
                this.addParagraph(storyID, sectionID, obj2[id].text, obj2[id].succeeding_paragraph_id);
            }
            else {
                if (obj1[id] && obj1[id].note !== obj2[id].note) {
                    if (obj2[id].note) {
                        this.setNote(sectionID, JSON.parse(id), obj2[id].note);
                    }
                    else {
                        this.deleteNote(sectionID, JSON.parse(id));
                    }
                }
                if (edit) {
                    this.editParagraph(storyID, sectionID, obj2[id].text, JSON.parse(id));
                }
            }
        }
    }
};
EditService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [story_service_1.StoryService, api_service_1.ApiService])
], EditService);
exports.EditService = EditService;
//# sourceMappingURL=edit.service.js.map