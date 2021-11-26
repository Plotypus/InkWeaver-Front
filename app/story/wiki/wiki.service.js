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
const api_service_1 = require('../../shared/api.service');
let WikiService = class WikiService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    move_segment(sid, to_pid, to_idx) {
        this.apiService.send({
            action: 'move_segment',
            segment_id: sid,
            to_parent_id: to_pid,
            to_index: to_idx
        });
    }
    move_template_heading(sid, title, to_idx) {
        this.apiService.send({
            action: 'move_segment',
            segment_id: sid,
            template_heading_title: title,
            to_index: to_idx
        });
    }
    move_page(pid, to_pid, to_idx) {
        this.apiService.send({
            action: 'move_page',
            page_id: pid,
            to_parent_id: to_pid,
            to_index: to_idx
        });
    }
    move_heading(sid, title, to_idx) {
        this.apiService.send({
            action: 'move_segment',
            page_id: sid,
            heading_title: title,
            to_index: to_idx
        });
    }
    getWikiSegmentHierarchy(segment_id, callback = () => { }) {
        this.apiService.send({
            action: 'get_wiki_segment_hierarchy',
            segment_id: segment_id
        }, callback);
    }
    getWikiSegment(sid, callback = () => { }) {
        this.apiService.send({
            "action": "get_wiki_segment",
            "segment_id": sid
        }, callback);
    }
    getWikiPage(page_id, callback = () => { }, metadata = {}) {
        this.apiService.send({
            action: 'get_wiki_page',
            page_id: page_id
        }, callback, metadata);
    }
    getWikiAliasList() {
        this.apiService.send({
            action: 'get_wiki_alias_list'
        });
    }
    editWiki(wiki_id, u_type, text) {
        this.apiService.send({
            action: 'edit_wiki',
            wiki_id: wiki_id,
            update: {
                update_type: u_type,
                title: text
            }
        });
    }
    editSegment(segment_id, update_type, new_text) {
        this.apiService.send({
            action: 'edit_segment',
            "segment_id": segment_id,
            "update": {
                "update_type": "set_title",
                "title": new_text
            }
        });
    }
    editPage(page_id, update_type, new_text) {
        this.apiService.send({
            "action": "edit_page",
            "page_id": page_id,
            "update": {
                "update_type": update_type,
                "title": new_text
            }
        });
    }
    editHeading(page_id, heading_title, update_type, new_text) {
        if (update_type == "set_text")
            this.apiService.send({
                "action": "edit_heading",
                "page_id": page_id,
                "heading_title": heading_title,
                "update": {
                    "update_type": update_type,
                    "text": new_text
                }
            });
        else
            this.apiService.send({
                "action": "edit_heading",
                "page_id": page_id,
                "heading_title": heading_title,
                "update": {
                    "update_type": update_type,
                    "title": new_text
                }
            });
    }
    editAlias(aid, nName) {
        this.apiService.send({
            "action": "change_alias_name",
            "alias_id": aid,
            "new_name": nName
        });
    }
    editTempleteHeading(sid, title, type, nTitle) {
        if (type == 'set_title')
            this.apiService.send({
                "action": "edit_template_heading",
                "segment_id": sid,
                "template_heading_title": title,
                "update": {
                    "update_type": type,
                    "title": nTitle
                }
            });
        else
            this.apiService.send({
                "action": "edit_template_heading",
                "segment_id": sid,
                "template_heading_title": title,
                "update": {
                    "update_type": type,
                    "text": nTitle
                }
            });
    }
    addSegment(title, pid, callback = () => { }) {
        this.apiService.send({
            "action": "add_segment",
            "title": title,
            "parent_id": pid
        }, callback);
    }
    addTempleteHeading(title, sid) {
        this.apiService.send({
            "action": "add_template_heading",
            "title": title,
            "segment_id": sid
        });
    }
    addPage(title, sid, callback = () => { }) {
        this.apiService.send({
            "action": "add_page",
            "title": title,
            "parent_id": sid
        }, callback);
    }
    addHeading(title, page_id) {
        this.apiService.send({
            "action": "add_heading",
            "title": title,
            "page_id": page_id,
        });
    }
    deleteSegment(sid, callback = () => { }) {
        this.apiService.send({
            "action": "delete_segment",
            "segment_id": sid
        }, callback);
    }
    deletePage(pid, callback = () => { }) {
        this.apiService.send({
            "action": "delete_page",
            "page_id": pid
        }, callback);
    }
    deleteHeading(pid, title) {
        this.apiService.send({
            "action": "delete_heading",
            "page_id": pid,
            "heading_title": title
        });
    }
    deleteAlias(aid) {
        this.apiService.send({
            "action": "delete_alias",
            "alias_id": aid
        });
    }
    deleteTempleteHeading(sid, title) {
        this.apiService.send({
            "action": "delete_template_heading",
            "segment_id": sid,
            "template_heading_title": title
        });
    }
    createWiki(title, summary, callback = () => { }) {
        this.apiService.send({
            "action": "create_wiki",
            "title": title,
            "summary": summary
        }, callback);
    }
};
WikiService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [api_service_1.ApiService])
], WikiService);
exports.WikiService = WikiService;
//# sourceMappingURL=wiki.service.js.map