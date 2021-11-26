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
const primeng_1 = require('primeng/primeng');
const story_service_1 = require('../story.service');
const edit_service_1 = require('./edit.service');
const wiki_service_1 = require('../wiki/wiki.service');
const user_service_1 = require('../../user/user.service');
const api_service_1 = require('../../shared/api.service');
const parser_service_1 = require('../../shared/parser.service');
const id_model_1 = require('../../models/id.model');
const stats_component_1 = require('../stats/stats.component');
let EditComponent = class EditComponent {
    constructor(router, storyService, editService, wikiService, userService, apiService, parserService) {
        this.router = router;
        this.storyService = storyService;
        this.editService = editService;
        this.wikiService = wikiService;
        this.userService = userService;
        this.apiService = apiService;
        this.parserService = parserService;
        this.dragNodeID = new id_model_1.ID();
        this.bookmark = { data: {} };
        this.newBookmark = {};
        this.suggest = {};
        this.predict = '';
        this.note = { display: 'none' };
        this.noteEditing = false;
        this.statMode = false;
    }
    ngOnInit() {
        this.data = this.apiService.data;
        this.data.tooltip.display = 'none';
        if (!this.apiService.messages) {
            this.router.navigate(['/login']);
        }
        window.onbeforeunload = () => {
            this.save();
        };
    }
    ngAfterViewInit() {
        this.editorRef = this.editor.el.nativeElement.querySelector('div.ql-editor');
        this.editor.onSelectionChange.subscribe((event) => {
            let idx = this.editor.quill.getSelection();
            if (idx) {
                let blot = this.editor.quill.getLine(idx.index);
                if (blot) {
                    let block = blot[0];
                    while (block && block.domNode && !block.domNode.id && block.parent) {
                        block = block.parent;
                    }
                    if (block && block.domNode && block.domNode.id) {
                        this.paragraphPosition = { $oid: block.domNode.id };
                    }
                }
            }
        });
        this.editor.onTextChange.subscribe((event) => {
            if (event.delta.ops[1] && event.delta.ops[1].delete) {
                this.saveNeeded = true;
            }
            if (this.data.story.position_context) {
                if (this.data.story.position_context.paragraph_id) {
                    if (this.scrollToParagraph(this.data.story.position_context.paragraph_id.$oid)) {
                        this.data.story.position_context = null;
                    }
                }
                else if (this.data.story.position_context.cursor) {
                    let node = document.getElementById(this.data.story.position_context.cursor);
                    if (node) {
                        let blot = Quill['find'](node);
                        if (blot) {
                            let idx = this.editor.quill.getIndex(blot);
                            if (idx) {
                                let offset = node.innerText === '\n' ? 0 : node.innerText.length;
                                this.editor.quill.setSelection(idx + offset, 0);
                                this.data.story.position_context = null;
                            }
                        }
                    }
                }
            }
            this.suggest.display = 'none';
            if (event.delta.ops[0] && event.delta.ops[1]) {
                let index = event.delta.ops[0].retain;
                let insert = event.delta.ops[1].insert;
                let deleted = event.delta.ops[1].delete;
                if (index && (insert || deleted)) {
                    if (this.predict && insert) {
                        this.predict += insert;
                    }
                    else if (this.predict && deleted) {
                        this.predict = this.predict.substring(0, this.predict.length - deleted);
                    }
                    else {
                        let text = this.editor.quill.getText(0, index + 1);
                        this.predict = text.slice(text.lastIndexOf('\n') + 1);
                        this.predict = this.predict.slice(this.predict.lastIndexOf(' ') + 1);
                        this.insertIndex = index - (this.predict.length - 1);
                    }
                    if (this.predict) {
                        let valIndex = 0;
                        let bounds = this.editor.quill.getBounds(index);
                        let top = bounds.top + 200;
                        for (let aliasID in this.data.aliasTable) {
                            let alias = this.data.aliasTable[aliasID];
                            if (alias.alias_name.startsWith(this.predict)) {
                                if (this.suggest.display === 'none') {
                                    this.suggest = {
                                        options: [{
                                                label: alias.alias_name, value: {
                                                    title: alias.alias_name, page_id: alias.page_id, index: valIndex++
                                                }
                                            }],
                                        display: 'block', top: top + 'px', left: bounds.left + 'px'
                                    };
                                    this.suggest.value = this.suggest.options[0].value;
                                }
                                else {
                                    this.suggest.options.push({
                                        label: alias.alias_name, value: {
                                            title: alias.alias_name, page_id: alias.page_id, index: valIndex++
                                        }
                                    });
                                }
                            }
                        }
                        if (this.suggest.display === 'none') {
                            this.predict = '';
                        }
                    }
                }
                else {
                    this.predict = '';
                }
            }
            let threads = this.editorRef.querySelectorAll('a[href]');
            for (let thread of threads) {
                if (!thread.onclick) {
                    let linkID = thread.getAttribute('href');
                    let ids = linkID.split('-');
                    let pageID = { $oid: ids[1] };
                    if (ids[2]) {
                        thread.id = ids[2];
                        if (ids[2] === 'true') {
                            thread.onclick = (event) => {
                                event.preventDefault();
                                if (this.data.tooltip.display === 'block') {
                                    this.data.tooltip.display = 'none';
                                }
                                else {
                                    this.passiveLinkID = { $oid: ids[0] };
                                    let passiveLink = this.data.passiveLinkTable[JSON.stringify(this.passiveLinkID)];
                                    if (passiveLink) {
                                        let alias = this.data.aliasTable[JSON.stringify(passiveLink.alias_id)];
                                        if (alias) {
                                            let aBlot = Quill['find'](event.target);
                                            let index = this.editor.quill.getIndex(aBlot);
                                            let bounds = this.editor.quill.getBounds(index);
                                            let top = bounds.top + 200;
                                            this.data.tooltip = {
                                                passive: true, display: 'block',
                                                top: top + 'px', left: bounds.left + 'px'
                                            };
                                            this.loopPages(this, this.data.wikiNav[0], (page) => {
                                                if (JSON.stringify(alias.page_id) === JSON.stringify(page.data.id)) {
                                                    this.data.tooltip.text = 'We suggest linking to ' + page.data.title;
                                                }
                                            }, (segment) => { });
                                        }
                                    }
                                }
                            };
                        }
                    }
                    else {
                        thread.onclick = (event) => {
                            event.preventDefault();
                            this.wikiService.getWikiPage(pageID, () => {
                                this.router.navigate(['story/wiki']);
                            }, { page_id: pageID, load: true });
                        };
                        thread.onmouseenter = (event) => {
                            let aBlot = Quill['find'](event.target);
                            let index = this.editor.quill.getIndex(aBlot);
                            let bounds = this.editor.quill.getBounds(index);
                            let top = bounds.top + 200;
                            this.data.tooltip = {
                                text: '', passive: false,
                                display: 'block', top: top + 'px', left: bounds.left + 'px'
                            };
                            this.wikiService.getWikiPage(pageID);
                        };
                        thread.onmouseleave = (event) => {
                            this.data.tooltip.display = 'none';
                        };
                    }
                }
            }
            let notes = this.editorRef.querySelectorAll('code');
            for (let note of notes) {
                if (!note.onclick) {
                    note.onclick = (event) => {
                        if (this.note.display === 'block') {
                            this.note.display = 'none';
                        }
                        else {
                            let cBlot = Quill['find'](event.target);
                            let index = this.editor.quill.getIndex(cBlot);
                            let bounds = this.editor.quill.getBounds(index);
                            let top = bounds.top + 200;
                            this.note = {
                                text: event.target.innerHTML, index: index, length: event.target.innerHTML.length,
                                display: 'block', top: top + 'px', left: bounds.left + 'px'
                            };
                        }
                    };
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });
        this.setHotkey(this);
    }
    ngOnDestroy() {
        this.save();
    }
    keyUp(event) {
        if (event.key === 'Enter' && this.suggest.display !== 'block' && !this.noteEditing) {
            let idx = this.editor.quill.getSelection();
            if (idx) {
                let blot = this.editor.quill.getLine(idx.index);
                if (blot) {
                    let block = blot[0];
                    while (block && block.domNode && !block.domNode.id && block.parent) {
                        block = block.parent;
                    }
                    if (block && block.domNode && block.domNode.id) {
                        block.domNode.id = 'new';
                    }
                }
            }
            this.save(false, false);
        }
    }
    setHotkey(editComp) {
        setTimeout(() => {
            if (editComp.editor.quill) {
                editComp.editor.quill.keyboard.bindings['9'].unshift({
                    handler: (range, context) => {
                        if (editComp.suggest.display === 'block') {
                            editComp.suggest.display = 'none';
                            editComp.word = editComp.suggest.value.title;
                            editComp.newLinkID = editComp.suggest.value.page_id;
                            editComp.range = { index: editComp.insertIndex, length: editComp.predict.length };
                            editComp.createLink();
                            editComp.editor.quill.insertText(editComp.insertIndex + editComp.word.length, ' ', 'link', false);
                            editComp.editor.quill.setSelection(editComp.insertIndex + editComp.word.length + 1, 0);
                            return false;
                        }
                        else {
                            return true;
                        }
                    }, key: 9
                });
                editComp.editor.quill.keyboard.bindings['13'].unshift({
                    handler: (range, context) => {
                        if (editComp.suggest.display === 'block') {
                            editComp.suggest.display = 'none';
                            editComp.word = editComp.suggest.value.title;
                            editComp.newLinkID = editComp.suggest.value.page_id;
                            editComp.range = { index: editComp.insertIndex, length: editComp.predict.length };
                            editComp.createLink();
                            editComp.editor.quill.insertText(editComp.insertIndex + editComp.word.length, ' ', 'link', false);
                            editComp.editor.quill.setSelection(editComp.insertIndex + editComp.word.length + 1, 0);
                            return false;
                        }
                        else if (editComp.noteEditing) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }, key: 13
                });
                editComp.editor.quill.keyboard.addBinding({
                    key: 'L',
                    altKey: true
                }, (range, context) => {
                    editComp.openLinkCreator(editComp);
                });
                editComp.editor.quill.keyboard.addBinding({
                    key: 'up'
                }, (range, context) => {
                    if (editComp.suggest.display === 'block') {
                        let index = editComp.suggest.value.index;
                        if (index > 0) {
                            editComp.suggest.value = editComp.suggest.options[--index].value;
                        }
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                editComp.editor.quill.keyboard.addBinding({
                    key: 'down'
                }, (range, context) => {
                    if (editComp.suggest.display === 'block') {
                        let index = editComp.suggest.value.index;
                        if (index < editComp.suggest.options.length - 1) {
                            editComp.suggest.value = editComp.suggest.options[++index].value;
                        }
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            else {
                editComp.setHotkey(editComp);
            }
        }, 500);
    }
    openLinkCreator(editor) {
        if (!editor) {
            editor = this;
        }
        editor.range = editor.editor.quill.getSelection();
        if (editor.range) {
            editor.word = editor.editor.quill.getText(editor.range.index, editor.range.length);
            editor.range.index += editor.word.search(/\S|$/);
            editor.word = editor.word.trim();
            editor.range.length = editor.word.length;
            editor.newLinkPages = [{ label: 'Create New Page', value: null }];
            editor.newSegments = [];
            editor.loopPages(editor, editor.data.wikiNav[0], (page) => {
                editor.newLinkPages.push({ label: page.data.title, value: page.data.id });
            }, (seg) => {
                editor.newSegments.push({ label: seg.data.title, value: seg.data.id });
            });
            editor.newLinkID = editor.newLinkPages[0].value;
            editor.newSegmentID = editor.newSegments[0].value;
            editor.displayLinkCreator = true;
        }
    }
    openSectionCreator() {
        this.newSectionTitle = '';
        this.displaySectionCreator = true;
    }
    openSectionRenamer() {
        this.renaming = true;
        this.newSectionTitle = this.data.section.data.title;
    }
    openBookmarkCreator() {
        let idx = this.editor.quill.getSelection(true);
        if (idx) {
            let blot = this.editor.quill.getLine(idx.index);
            if (blot) {
                let block = blot[0];
                while (block && block.domNode && !block.domNode.id && block.parent) {
                    block = block.parent;
                }
                if (block && block.domNode && block.domNode.id) {
                    this.displayBookmarkCreator = true;
                    this.newBookmark.name = '';
                    this.newBookmark.paragraphID = { $oid: block.domNode.id };
                }
            }
        }
    }
    openBookmarkRenamer() {
        this.bookmarkRenaming = true;
        this.newBookmark.name = this.bookmark.data.name;
    }
    createLink() {
        this.word = this.word.trim();
        if (this.newLinkID) {
            this.editor.quill.deleteText(this.range.index, this.range.length);
            this.editor.quill.insertText(this.range.index, this.word, 'link', 'new' + Math.random() + '-' + this.newLinkID.$oid);
            this.editor.quill.setSelection(this.range.index + this.word.length, 0);
            this.displayLinkCreator = false;
        }
        else {
            this.wikiService.addPage(this.word, this.newSegmentID, (reply) => {
                this.newLinkID = reply.page_id;
                this.createLink();
            });
        }
    }
    approvePassive() {
        if (this.saveNeeded) {
            this.save(false, false);
            this.saveNeeded = false;
        }
        this.storyService.approvePassiveLink(this.passiveLinkID);
        this.data.tooltip.display = 'none';
    }
    rejectPassive() {
        if (this.saveNeeded) {
            this.save(false, false);
            this.saveNeeded = false;
        }
        this.storyService.rejectPassiveLink(this.passiveLinkID);
        this.data.tooltip.display = 'none';
    }
    switchStats(event) {
        if (event.checked) {
            this.save();
        }
        else {
            this.apiService.refreshStoryContent();
        }
    }
    selectSection(event) {
        this.data.section = event.node;
        this.renaming = false;
        this.note.display = 'none';
        this.data.tooltip.display = 'none';
        this.suggest.display = 'none';
        if (this.statMode) {
            this.stats.getSectionStats();
        }
        else {
            this.save();
            this.apiService.refreshStoryContent(event.node.data.section_id, event.node.data.title);
        }
        this.data.prevSection = event.node;
    }
    addSection() {
        this.displaySectionCreator = false;
        this.editService.addSection(this.data.section.data.section_id, this.newSectionTitle);
    }
    renameStory(event) {
        this.renaming = false;
        event.stopPropagation();
        this.storyService.editStory(this.data.story.story_id, this.newSectionTitle);
    }
    renameSection(event) {
        this.renaming = false;
        event.stopPropagation();
        this.editService.editSectionTitle(this.data.section.data.section_id, this.newSectionTitle);
    }
    cancelRenameSection(event) {
        this.renaming = false;
        event.stopPropagation();
    }
    deleteSection() {
        this.displaySectionDeleter = false;
        this.editService.deleteSection(this.data.section.data.section_id);
        this.selectSection({ node: this.data.section.parent });
    }
    selectBookmark(event) {
        if (event.node.data.section_id) {
            this.bookmark = event.node;
            this.bookmarkRenaming = false;
            let bookmark = event.node.data;
            if (JSON.stringify(this.data.section.data.section_id) === JSON.stringify(bookmark.section_id)) {
                this.scrollToParagraph(bookmark.paragraph_id.$oid);
            }
            else {
                this.data.story.position_context = { section_id: bookmark.section_id, paragraph_id: bookmark.paragraph_id };
                this.apiService.refreshStoryContent(bookmark.section_id, null);
            }
        }
        else {
            this.oldBookmark = this.bookmark;
        }
    }
    addBookmark() {
        this.displayBookmarkCreator = false;
        this.editService.addBookmark(this.data.section.data.section_id, this.newBookmark.paragraphID, this.newBookmark.name, this.bookmark.data.index + 1);
    }
    renameBookmark(event) {
        event.stopPropagation();
        this.bookmarkRenaming = false;
        this.editService.editBookmark(this.bookmark.data.bookmark_id, this.newBookmark.name);
    }
    cancelRenameBookmark(event) {
        event.stopPropagation();
        this.bookmarkRenaming = false;
    }
    deleteBookmark() {
        this.displayBookmarkDeleter = false;
        this.editService.deleteBookmark(this.bookmark.data.bookmark_id);
    }
    loopPages(editor, segment, func, sFunc) {
        if (segment.type === 'page') {
            func(segment);
        }
        else {
            sFunc(segment);
            if (segment.children) {
                for (let seg of segment.children) {
                    editor.loopPages(editor, seg, func, sFunc);
                }
            }
        }
    }
    setContextMenu(node) {
        this.selectSection({ node: node });
        if (node.parent) {
            this.contextMenuItems = [
                { label: 'Rename Section', command: () => { this.openSectionRenamer(); } },
                { label: 'Delete Section', command: () => { this.displaySectionDeleter = true; } }
            ];
        }
        else {
            this.contextMenuItems = [{ label: 'Rename Story', command: () => { this.openSectionRenamer(); } }];
        }
        this.contextMenuItems.unshift({ label: 'Add Subsection', command: () => { this.openSectionCreator(); } });
    }
    scrollToParagraph(paragraphID) {
        let paragraph = document.getElementById(paragraphID);
        if (paragraph) {
            paragraph.scrollIntoView();
            window.scrollBy(0, -10000);
            paragraph.animate({
                background: ['lightyellow', 'white'], easing: 'ease'
            }, 5000);
            return true;
        }
        else {
            return false;
        }
    }
    addNote() {
        let idx = this.editor.quill.getSelection(true);
        if (idx) {
            let blot = this.editor.quill.getLine(idx.index);
            if (blot) {
                let block = blot[0];
                while (block && block.domNode && !block.domNode.id && block.parent) {
                    block = block.parent;
                }
                if (block && block.domNode && block.domNode.id) {
                    idx = this.editor.quill.getIndex(block);
                    this.editor.quill.insertText(idx, ' ', 'code', ' ');
                    let bounds = this.editor.quill.getBounds(idx);
                    let top = bounds.top + 200;
                    this.note = {
                        text: '', index: idx, length: 0,
                        display: 'block', top: top + 'px', left: bounds.left + 'px'
                    };
                    this.noteEditing = true;
                }
            }
        }
    }
    saveNote() {
        this.noteEditing = false;
        this.editor.quill.deleteText(this.note.index, this.note.length);
        this.editor.quill.insertText(this.note.index, this.note.text, 'code', ' ');
        this.note.display = 'none';
        this.save(false, false);
    }
    save(refresh = false, setPosition = true) {
        if (this.data.storyDisplay && this.data.prevSection.data) {
            if (setPosition) {
                this.data.story.position_context = {
                    section_id: this.data.prevSection.data.section_id, paragraph_id: this.paragraphPosition
                };
                this.userService.setUserStoryPositionContext(this.data.prevSection.data.section_id, this.paragraphPosition);
            }
            let header = this.editorRef.querySelector('h1');
            let paragraphs = this.editorRef.querySelectorAll('p');
            if (paragraphs && paragraphs.length > 0) {
                let newContentObject = this.parserService.parseHtml(paragraphs);
                this.editService.compare(this.data.contentObject, newContentObject, this.data.story.story_id, this.data.prevSection.data.section_id);
                if (refresh) {
                    this.apiService.refreshStoryContent(this.data.prevSection.data.section_id, this.data.prevSection.data.title);
                }
            }
            if (header && header.innerHTML !== this.data.prevSection.data.title && JSON.stringify(this.data.prevSection.data.section_id) !== JSON.stringify(this.data.story.section_id)) {
                this.editService.editSectionTitle(this.data.prevSection.data.section_id, header.innerHTML);
            }
        }
    }
    sectionDrag(node) {
        if (node.parent) {
            this.moveSection = node;
        }
    }
    sectionDragEnter(node) {
        if (this.moveSection && node.parent) {
            this.dragNodeID = node.data.section_id;
        }
    }
    sectionDrop(node) {
        if (this.moveSection && node.parent) {
            let index = node.parent.children.indexOf(node);
            this.editService.moveSection(this.moveSection.data.section_id, node.parent.data.section_id, index);
        }
        this.endDrag();
    }
    endDrag() {
        this.moveSection = null;
        this.dragNodeID = new id_model_1.ID();
    }
};
__decorate([
    core_1.ViewChild(primeng_1.Editor), 
    __metadata('design:type', primeng_1.Editor)
], EditComponent.prototype, "editor", void 0);
__decorate([
    core_1.ViewChild(stats_component_1.StatsComponent), 
    __metadata('design:type', stats_component_1.StatsComponent)
], EditComponent.prototype, "stats", void 0);
EditComponent = __decorate([
    core_1.Component({
        selector: 'edit',
        templateUrl: './app/story/edit/edit.component.html'
    }), 
    __metadata('design:paramtypes', [router_1.Router, story_service_1.StoryService, edit_service_1.EditService, wiki_service_1.WikiService, user_service_1.UserService, api_service_1.ApiService, parser_service_1.ParserService])
], EditComponent);
exports.EditComponent = EditComponent;
//# sourceMappingURL=edit.component.js.map