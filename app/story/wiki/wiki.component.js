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
const router_1 = require('@angular/router');
const edit_service_1 = require('../edit/edit.service');
const wiki_service_1 = require('./wiki.service');
const api_service_1 = require('../../shared/api.service');
const parser_service_1 = require('../../shared/parser.service');
const stats_component_1 = require('../stats/stats.component');
const stats_service_1 = require('../stats/stats.service');
let WikiComponent = class WikiComponent {
    constructor(wikiService, apiService, editService, parserService, statsService, router) {
        this.wikiService = wikiService;
        this.apiService = apiService;
        this.editService = editService;
        this.parserService = parserService;
        this.statsService = statsService;
        this.router = router;
        this.wikiPageContent = [];
        this.showAddHeadDialog = false;
        this.showDeleteDialog = false;
        this.allCategories = [];
        this.allPages = [];
        this.nestedPages = [];
        this.selectedValues = [];
        this.rename = false;
        this.fromLink = true;
        this.empty = false;
        this.statMode = false;
        this.dragMode = false;
    }
    ;
    ngOnInit() {
        this.data = this.apiService.data;
        this.nav = this.apiService.data.wikiNav;
        this.filter = "";
        this.data.wikiFuctions.push(this.onTempleteHeadingCallback());
        if (this.data.selectedEntry && (this.data.page != null && this.data.page.hasOwnProperty("title"))) {
            if (this.data.selectedEntry.type == 'category')
                this.wikiService.getWikiSegment(this.data.selectedEntry.data.id, this.onGetCallback());
            else if (this.data.selectedEntry.type == 'page')
                this.wikiService.getWikiPage(this.data.selectedEntry.data.id, this.onGetCallback());
            else {
                this.wikiPage = null;
                this.apiService.refreshWikiInfo();
            }
        }
        else {
            this.data.selectedEntry = this.data.wikiNav[0];
        }
        this.updateData();
    }
    ngAfterViewInit() {
        this.calcHeight();
    }
    parsePage() {
        this.wikiPageContent = [];
        this.wikiPage = this.data.page;
        this.disabled = [true];
        this.icons = ['fa-pencil'];
        this.wikiPageContent.push({
            'title': this.wikiPage.title,
            'text': ""
        });
        this.toDelete = this.wikiPage.title;
        for (let i = 0; i < this.wikiPage.headings.length; i++) {
            this.disabled.push(true);
            this.icons.push('fa-pencil');
            this.wikiPageContent.push({
                'title': this.wikiPage.headings[i].title,
                'text': this.wikiPage.headings[i].text,
                'active': false
            });
        }
        this.calcHeight();
    }
    setContextMenu(node) {
        this.renameNode = node;
        this.rename = false;
        if (node.type == 'page') {
            this.contextMenuItems = [{ label: 'Rename',
                    command: () => {
                        this.rename = true;
                        this.newName = node.label;
                        window.setTimeout(function () {
                            let input = document.getElementById("newName");
                            if (input) {
                                document.getElementById('newName').focus();
                            }
                        }, 0);
                    } },
                { label: 'Delete', command: () => { this.onShow(0); } }];
        }
        else if (node.type == 'category' || node.type == 'title') {
            this.contextMenuItems = [{ label: 'Rename', command: () => {
                        this.rename = true;
                        this.newName = node.label;
                        window.setTimeout(function () {
                            let input = document.getElementById("newName");
                            if (input) {
                                document.getElementById('newName').focus();
                            }
                        }, 0);
                    } },
                { label: 'Add Category', command: () => { this.onAddPage(0); } },
                { label: 'Add Page', command: () => { this.onAddPage(0); } },
                { label: 'Delete', command: () => { this.onShow(0); } }];
        }
    }
    onRename(node, mode) {
        if (mode) {
            if (node.type == 'category') {
                this.wikiService.editSegment(node.data.id, 'set_title', this.newName);
            }
            else if (node.type == 'title') {
                this.wikiService.editWiki(this.data.wiki.wiki_id, 'set_title', this.newName);
            }
            else {
                this.wikiService.editPage(node.data.id, 'set_title', this.newName);
            }
        }
        else {
            this.newName = "";
        }
        this.rename = false;
    }
    onSelected(page) {
        this.data.selectedEntry = page.node;
        if (!this.statMode) {
            this.rename = false;
            if (page.node.type == 'title') {
                this.wikiPage = null;
                this.apiService.refreshWikiInfo();
            }
            else if (page.node.type == "category") {
                page.node.expanded = !page.node.expanded;
                this.wikiService.getWikiSegment(page.node.data.id, this.onGetCallback());
                this.heading = "Templete Heading";
            }
            else {
                this.wikiService.getWikiPage(page.node.data.id, this.onGetCallback());
                this.heading = "Heading";
            }
        }
        else {
            if (page.node.type == "category")
                page.node.expanded = !page.node.expanded;
            this.stats.showWikiStats();
        }
    }
    addToWiki(add) {
        this.showAddDialog = false;
        this.empty = false;
        if (add) {
            if (this.addContent == 'Category') {
                this.wikiService.addSegment(this.pageName, this.data.selectedEntry.data.id, this.onAddCallback());
            }
            else {
                this.wikiService.addPage(this.pageName, this.data.selectedEntry.data.id, this.onAddCallback());
            }
            this.pageName = "";
        }
    }
    onAddPage(type) {
        this.showAddDialog = true;
        this.empty = false;
        if (type == 0)
            this.addContent = "Category";
        else
            this.addContent = "Page";
        this.pageName = "";
        let idx = this.allCategories.findIndex(this.selectedEntry());
        if (idx != -1)
            this.defAdd = this.allCategories[idx].value;
    }
    addHeading() {
        this.headingName = "";
        this.empty = false;
        this.showAddHeadDialog = true;
    }
    createHeading(addMore) {
        if (!addMore) {
            this.showAddHeadDialog = false;
            this.empty = false;
        }
        let temp = {};
        if (this.data.selectedEntry.type == 'category') {
            this.wikiService.addTempleteHeading(this.headingName, this.data.selectedEntry.data.id);
        }
        else {
            this.wikiService.addHeading(this.headingName, this.data.selectedEntry.data.id);
        }
        temp = {
            'title': this.headingName,
            'text': "",
        };
        this.wikiPage.headings.push(temp);
        temp['active'] = false;
        this.wikiPageContent.push(temp);
        this.onEdit(this.wikiPageContent.length - 1);
        this.disabled.push(true);
        this.icons.push('fa-pencil');
        this.headingName = "";
    }
    onTextChange(text, mode) {
        if (!this.empty) {
            this.empty = true;
        }
        this.exist = false;
        if (mode) {
            if (this.wikiPageContent.filter(heading => heading.title === text).length != 0)
                this.exist = true;
        }
        else {
            if (this.data.wikiFlatten.filter((ele) => ele.label === text).length != 0)
                this.exist = true;
        }
    }
    onEdit(idx) {
        for (let i = 1; i < this.wikiPageContent.length; i++) {
            this.wikiPageContent[i].active = false;
            let temp = this.wikiPage.headings[i - 1].text;
            this.wikiPage.headings[i - 1].text = "";
            this.wikiPage.headings[i - 1].text = temp;
        }
        this.wikiPageContent[idx].active = true;
        this.onSavePage();
    }
    onDisable(idx) {
        let title = "";
        let text = "";
        window.setTimeout(function () {
            let input = document.getElementById("editable");
            if (input) {
                document.getElementById('editable').focus();
            }
        }, 0);
        if (this.disabled[idx]) {
            this.icons[idx] = 'fa-check';
            if (idx == 0) {
                title = this.wikiPage.title;
                this.wikiPageContent[idx]["title"] = title;
            }
            else {
                title = this.wikiPage.headings[idx - 1].title;
                this.wikiPageContent[idx]["title"] = title;
            }
        }
        else {
            this.icons[idx] = 'fa-pencil';
            if (this.data.selectedEntry.type == 'category') {
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    this.wikiService.editSegment(this.data.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.data.selectedEntry.data.title = this.wikiPage.title;
                }
                else if (idx != 0 && !(this.wikiPageContent[idx].title === this.wikiPage.title)) {
                    this.wikiService.editTempleteHeading(this.data.selectedEntry.data.id, this.wikiPageContent[idx].title, "set_title", this.wikiPage.headings[idx - 1].title);
                }
            }
            else {
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    this.wikiService.editPage(this.data.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.data.selectedEntry.data.title = this.wikiPage.title;
                }
                else if (idx != 0 && !(this.wikiPageContent[idx].title === this.wikiPage.title)) {
                    this.wikiService.editHeading(this.data.selectedEntry.data.id, this.wikiPageContent[idx].title, 'set_title', this.wikiPage.headings[idx - 1].title);
                }
            }
        }
        this.disabled[idx] = !this.disabled[idx];
    }
    onCancel(idx) {
        if (idx == 0) {
            this.wikiPage.title = this.wikiPageContent[0].title;
        }
        else {
            this.wikiPage.headings[idx - 1].title = this.wikiPageContent[idx].title;
        }
        this.disabled[idx] = !this.disabled[idx];
    }
    editAlias(alias) {
        if (alias.state) {
            alias.state = !alias.state;
            alias.icon = "fa-check";
            alias.prev = alias.name;
        }
        else {
            alias.state = !alias.state;
            alias.icon = "fa-pencil";
            if (!(alias.prev === alias.name))
                this.wikiService.editAlias(alias.id, alias.name);
            alias.prev = "";
        }
    }
    cancelAlias(alias) {
        alias.name = alias.prev;
        alias.state = true;
    }
    onSavePage() {
        for (let i = 0; i < this.wikiPage.headings.length; i++) {
            if (!(this.wikiPageContent[i + 1].text === this.wikiPage.headings[i].text)) {
                this.wikiPageContent[i + 1].text = this.wikiPage.headings[i].text;
                if (this.data.selectedEntry.type == 'category')
                    this.wikiService.editTempleteHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);
                else
                    this.wikiService.editHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);
            }
        }
    }
    onShow(id, idx) {
        this.type = id;
        if (this.type == 0) {
            let idx = this.data.wikiFlatten.findIndex(this.selectedEntry());
            if (idx != -1)
                this.defDel = this.data.wikiFlatten[idx].value;
            this.nestedPages = this.convertLabelValueArray(this.defDel);
        }
        else if (this.type == 1) {
            this.headID = idx;
            this.defDel = this.wikiPageContent[idx].title;
        }
        this.showDeleteDialog = true;
    }
    onDeletePage(page) {
        this.showDeleteDialog = false;
        if (!page)
            return;
        if (this.data.selectedEntry.type === 'category') {
            this.parserService.deleteSegment(this.data.wikiNav[0], this.data.selectedEntry.data.id);
            this.wikiService.deleteSegment(this.data.selectedEntry.data.id, this.onDeleteCallback());
        }
        else {
            this.parserService.deletePage(this.data.wikiNav[0], this.data.selectedEntry.data.id);
            this.wikiService.deletePage(this.data.selectedEntry.data.id, this.onDeleteCallback());
        }
        this.wikiPage = null;
        this.data.page = null;
        this.data.selectedEntry = this.data.wikiNav[0];
    }
    deleteAlias(alias) {
        this.wikiService.deleteAlias(alias.id);
    }
    onDeleteHeading(del) {
        this.showDeleteDialog = false;
        if (del) {
            if (this.data.selectedEntry.type === 'category') {
                this.wikiService.deleteTempleteHeading(this.data.selectedEntry.data.id, this.defDel);
            }
            else {
                this.wikiService.deleteHeading(this.data.selectedEntry.data.id, this.defDel);
            }
            this.wikiPageContent.splice(this.headID, 1);
            this.wikiPage.headings.splice(this.headID - 1, 1);
        }
    }
    onReference(ref) {
        this.data.story.position_context = { section_id: ref.section_id, paragraph_id: ref.paragraph_id };
        this.apiService.refreshStoryContent(ref.section_id, null);
        this.router.navigate(['/story/edit']);
    }
    updateData() {
        let ele;
        let temp = [];
        if (this.data.wikiNav) {
            this.data.wikiFlatten = [];
            temp = this.parserService.getTreeArray(this.data.wikiNav[0]);
            for (let idx in temp) {
                ele = temp[idx];
                if (ele.type == 'category' || ele.type == 'title') {
                    this.allCategories.push({ label: ele.label, value: ele });
                }
                else if (ele.type == 'page')
                    this.allPages.push({ label: ele.label, value: ele });
                this.data.wikiFlatten.push({ label: ele.label, value: ele });
            }
            this.statsService.get_page_frequency(this.data.story.story_id, this.data.wiki.wiki_id);
        }
    }
    convertLabelValueArray(node) {
        if (node) {
            let result = [];
            let temp = this.parserService.getTreeArray(node);
            for (let idx in temp) {
                result.push({ label: temp[idx].label, value: temp[idx] });
            }
            return result;
        }
        return [];
    }
    selectedEntry() {
        return (option) => {
            return this.data.selectedEntry.label === option.label;
        };
    }
    onTempleteHeadingCallback() {
        return (reply) => {
            if (reply.event.includes('heading_added')) {
                let temp = {
                    'title': reply.title,
                    'text': "",
                };
                this.wikiPage.headings.push(temp);
                temp['active'] = false;
                this.wikiPageContent.push(temp);
                this.onEdit(this.wikiPageContent.length - 1);
                this.disabled.push(true);
                this.icons.push('fa-pencil');
            }
            else if (reply.event.includes('heading_updated')) {
                let idx = this.wikiPage.headings.findIndex((ele) => (ele.title === reply.template_heading_title) || (ele.title === reply.heading_title));
                if (reply.update.update_type === 'set_title') {
                    this.wikiPage.headings[idx].title = reply.update.title;
                    this.wikiPageContent[idx + 1].title = reply.update.title;
                }
                else {
                    this.wikiPage.headings[idx].text = reply.update.text;
                    this.wikiPageContent[idx + 1].text = reply.update.text;
                }
            }
            else if (reply.event.includes('heading_deleted')) {
                let idx = this.wikiPage.headings.findIndex((ele) => (ele.title === reply.template_heading_title) || (ele.title === reply.heading_title));
                if (idx != -1) {
                    this.wikiPageContent.splice(idx, 1);
                    this.wikiPage.headings.splice(idx - 1, 1);
                }
            }
            else {
            }
        };
    }
    onAddCallback() {
        return (reply) => {
            if (reply.event === "segment_added") {
                this.wikiService.getWikiSegment(reply.segment_id, this.onGetCallback());
            }
            else if (reply.event === "page_added") {
                this.wikiService.getWikiPage(reply.page_id, this.onGetCallback());
            }
            this.parserService.expandPath(this.data.selectedEntry);
            this.updateData();
        };
    }
    onDeleteCallback() {
        return (reply) => {
            this.updateData();
        };
    }
    onGetCallback() {
        return (reply) => {
            this.wikiPageContent = [];
            this.wikiPage = this.data.page;
            this.disabled = [true];
            this.icons = ['fa-pencil'];
            this.wikiPageContent.push({
                'title': this.wikiPage.title,
                'text': ""
            });
            this.toDelete = this.wikiPage.title;
            for (let i = 0; i < this.wikiPage.headings.length; i++) {
                this.disabled.push(true);
                this.icons.push('fa-pencil');
                this.wikiPageContent.push({
                    'title': this.wikiPage.headings[i].title,
                    'text': this.wikiPage.headings[i].text,
                    'active': false
                });
            }
            this.fromLink = false;
            this.calcHeight();
        };
    }
    calcHeight() {
        setTimeout(() => {
            let wiki_ele = document.getElementsByClassName("wiki")[0];
            let header = document.getElementsByClassName("ui-editor-toolbar ui-widget-header ui-corner-top ql-toolbar ql-snow")[0];
            let header_ele = document.getElementsByClassName("header")[0];
            let page_content_height;
            if (header_ele)
                page_content_height = wiki_ele.offsetHeight - header_ele.offsetHeight;
            else {
                if (header)
                    page_content_height = wiki_ele.offsetHeight - header.offsetHeight;
            }
            let div = document.getElementById("page_content");
            if (div)
                div.style.height = page_content_height + "px";
        }, 10);
    }
    nodeDrag(node) {
        if (node.parent) {
            this.dragNode = node;
            this.dragMode = true;
            this.mode_title = "Drag Mode Activated";
        }
        console.log("starting drag");
    }
    endDrag() {
        this.dragNode = null;
        this.dragMode = false;
        this.dragNodeId = null;
        console.log("end drag");
    }
    nodeDrop(node) {
        if (this.dragNode && (node != this.dragNode)) {
            if ((node.parent && node.parent == this.dragNode) || this.dragNode.type == 'title') {
                return;
            }
            else if (node.type == 'page' && this.dragNode.type == 'page') {
                let rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
                this.dragNode.parent.children.splice(rmidx, 1);
                let idx = node.parent.children.indexOf(node);
                node.parent.children.splice(idx + 1, 0, this.dragNode);
                this.dragNode.parent = node.parent;
                this.wikiService.move_page(this.dragNode.data.id, this.dragNode.parent.data.id, idx + 1);
            }
            else if (node.type == 'category' && this.dragNode.type == 'page') {
                let rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
                this.dragNode.parent.children.splice(rmidx, 1);
                let idx = this.parserService.firstPage(node);
                node.children.splice(idx, 0, this.dragNode);
                this.dragNode.parent = node;
                this.wikiService.move_page(this.dragNode.data.id, this.dragNode.parent.data.id, idx);
            }
            else if (node.type == 'category' && this.dragNode.type == 'category') {
                if (node.expanded) {
                    let rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
                    this.dragNode.parent.children.splice(rmidx, 1);
                    node.children.splice(0, 0, this.dragNode);
                    this.dragNode.parent = node;
                    this.wikiService.move_segment(this.dragNode.data.id, this.dragNode.parent.data.id, 0);
                }
                else {
                    let rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
                    this.dragNode.parent.children.splice(rmidx, 1);
                    let idx = node.parent.children.indexOf(node);
                    node.parent.children.splice(idx + 1, 0, this.dragNode);
                    this.dragNode.parent = node.parent;
                    this.wikiService.move_segment(this.dragNode.data.id, this.dragNode.parent.data.id, idx + 1);
                }
            }
            else if (node.type == 'title') {
                let rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
                this.dragNode.parent.children.splice(rmidx, 1);
                this.dragNode.parent = node;
                if (this.dragNode.type == 'category') {
                    node.children.splice(0, 0, this.dragNode);
                    this.wikiService.move_segment(this.dragNode.data.id, node.data.id, 0);
                }
                else {
                    let idx = this.parserService.firstPage(node);
                    node.children.splice(idx, 0, this.dragNode);
                    this.wikiService.move_page(this.dragNode.data.id, node.data.id, node.children.length + 1);
                }
            }
        }
        this.endDrag();
    }
    nodeDragEnter(node) {
        if (this.dragNode && (this.dragNode != node)) {
            if (this.dragNode.type == 'page' && node.type == 'category')
                node.expanded = true;
            if ((this.dragNode.type == "category" && node.type != "page") || (this.dragNode.type == "page"))
                this.dragNodeId = node.data.id;
        }
    }
    onStats() {
        if (!this.statMode) {
            if (this.data.selectedEntry.type == 'category')
                this.wikiService.getWikiSegment(this.data.selectedEntry.data.id, this.onGetCallback());
            else
                this.wikiService.getWikiPage(this.data.selectedEntry.data.id, this.onGetCallback());
        }
        else
            this.mode_title = "Stats Mode Activated";
    }
};
__decorate([
    core_1.ViewChild(stats_component_1.StatsComponent), 
    __metadata('design:type', stats_component_1.StatsComponent)
], WikiComponent.prototype, "stats", void 0);
WikiComponent = __decorate([
    core_1.Component({
        selector: 'wiki',
        templateUrl: './app/story/wiki/wiki.component.html',
    }), 
    __metadata('design:paramtypes', [wiki_service_1.WikiService, api_service_1.ApiService, edit_service_1.EditService, parser_service_1.ParserService, stats_service_1.StatsService, router_1.Router])
], WikiComponent);
exports.WikiComponent = WikiComponent;
//# sourceMappingURL=wiki.component.js.map