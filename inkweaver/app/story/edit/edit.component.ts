import {
    Component, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Editor, TreeNode, MenuItem } from 'primeng/primeng';
import { StoryService } from '../story.service';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { UserService } from '../../user/user.service';
import { ApiService } from '../../shared/api.service';
import { ParserService } from '../../shared/parser.service';

import { ID } from '../../models/id.model';
import { Segment } from '../../models/wiki/segment.model';
import { PageSummary } from '../../models/wiki/page-summary.model';

@Component({
    selector: 'edit',
    templateUrl: './app/story/edit/edit.component.html'
})
export class EditComponent {
    @ViewChild(Editor) editor: Editor;

    private data: any;
    private editorRef: any;
    private wordCount: number;
    private paragraphPosition: ID;

    // Dialogs
    private displayLinkCreator: boolean;
    private displaySectionCreator: boolean;
    private displaySectionDeleter: boolean;
    private displayBookmarkCreator: boolean;
    private displayBookmarkDeleter: boolean;

    // Creating links
    private range: any;
    private word: string;
    private newLinkID: ID;
    private newLinkPages: any;
    private newSegmentID: ID;
    private newSegments: any;

    // Adding/editing sections
    private renaming: boolean;
    private newSectionTitle: string;
    private contextMenuItems: MenuItem[];

    // Bookmarks
    private bookmark: TreeNode = { data: {} };
    private oldBookmark: TreeNode;
    private newBookmark: any = {};
    private bookmarkRenaming: boolean;

    private suggest: any = {};
    private predict: string = '';
    private note: any = { display: 'none' };

    constructor(
        private router: Router,
        private storyService: StoryService,
        private editService: EditService,
        private wikiService: WikiService,
        private userService: UserService,
        private apiService: ApiService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.data.tooltip.display = 'none';

        if (!this.apiService.messages) {
            this.router.navigate(['/login']);
        }
    }

    ngAfterViewInit() {
        // Initialize variables
        this.editorRef = this.editor.el.nativeElement.querySelector('div.ql-editor');

        // Add click event handlers to links when necessary
        this.editor.onSelectionChange.subscribe((event: any) => {
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

        this.editor.onTextChange.subscribe((event: any) => {
            if (this.data.story.position_context) {
                if (this.data.story.position_context.paragraph_id) {
                    this.scrollToParagraph(this.data.story.position_context.paragraph_id.$oid);
                }
                this.data.story.position_context = null;
            }

            this.suggest.display = 'none';
            if (event.delta.ops[0] && event.delta.ops[1]) {
                let index: number = event.delta.ops[0].retain;
                let insert: string = event.delta.ops[1].insert;
                let deleted: number = event.delta.ops[1].delete;
                if (index && (insert || deleted)) {
                    if (insert) {
                        this.predict += insert;
                    } else if (this.predict && deleted) {
                        this.predict = this.predict.substring(0, this.predict.length - deleted);
                    }
                    if (this.predict) {
                        let valIndex: number = 0;
                        let bounds = this.editor.quill.getBounds(index);
                        let top: number = bounds.top + 70;
                        this.loopPages(this, this.data.segment, (page: PageSummary) => {
                            if (page.title.startsWith(this.predict)) {
                                if (this.suggest.display === 'none') {
                                    this.suggest = {
                                        options: [{ label: page.title, value: { title: page.title, page_id: page.page_id, index: valIndex++ } }],
                                        display: 'block', top: top + 'px', left: bounds.left + 'px'
                                    };
                                    this.suggest.value = this.suggest.options[0].value;
                                } else {
                                    this.suggest.options.push({ label: page.title, value: { title: page.title, page_id: page.page_id, index: valIndex++ } });
                                }
                            }
                        }, (seg: Segment) => { });
                        if (this.suggest.display === 'none') {
                            this.predict = '';
                        }
                    }
                } else {
                    this.predict = '';
                }
            }

            let threads: any[] = this.editorRef.querySelectorAll('a[href]');
            for (let thread of threads) {
                if (!thread.onclick) {
                    let linkID: string = thread.getAttribute('href');
                    let ids: string[] = linkID.split('-');
                    let pageID: ID = { $oid: ids[1] };

                    thread.onclick = (event: any) => {
                        event.preventDefault();
                        this.wikiService.getWikiPage(pageID);
                        this.router.navigate(['/story/wiki']);
                    };
                    thread.onmouseenter = (event: any) => {
                        let aBlot = Quill['find'](event.target);
                        let index: number = this.editor.quill.getIndex(aBlot);
                        let bounds: any = this.editor.quill.getBounds(index);

                        let top: number = bounds.top + 70;
                        this.data.tooltip = {
                            text: '',
                            display: 'block', top: top + 'px', left: bounds.left + 'px'
                        };
                        this.wikiService.getWikiPage(pageID, { noflight: true });
                    };
                    thread.onmouseleave = (event: any) => {
                        this.data.tooltip.display = 'none';
                    };
                }
            }

            let notes: any[] = this.editorRef.querySelectorAll('code');
            for (let note of notes) {
                if (!note.onmouseenter) {
                    note.onmouseenter = (event: any) => {
                        let cBlot = Quill['find'](event.target);
                        let index: number = this.editor.quill.getIndex(cBlot);
                        let bounds: any = this.editor.quill.getBounds(index);

                        let top: number = bounds.top + 50;
                        this.note = {
                            text: event.target.innerHTML,
                            display: 'block', top: top + 'px', left: bounds.left + 'px'
                        };
                    };
                    note.onmouseleave = (event: any) => {
                        this.note.display = 'none';
                    };
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });
        this.setHotkey(this);
    }

    ngOnDestroy() {
        if (this.data.section.data) {
            this.data.story.position_context = { section_id: this.data.section.data.section_id, paragraph_id: this.paragraphPosition };
            this.userService.setUserStoryPositionContext(this.data.section.data.section_id,
                this.paragraphPosition);
        }
        if (this.data.prevSection.data) {
            this.save();
        }
    }

    public setHotkey(editComp: EditComponent) {
        setTimeout(function () {
            if (editComp.editor.quill) {
                editComp.editor.quill.keyboard.addBinding({
                    key: 'L',
                    altKey: true
                }, function () { editComp.openLinkCreator(editComp); });

                delete editComp.editor.quill.keyboard.bindings['9'];
                editComp.editor.quill.keyboard.addBinding({
                    key: 'tab'
                }, function (range, context) {
                    if (editComp.suggest.display === 'block') {
                        let word: string = context.prefix.slice(context.prefix.lastIndexOf(' ') + 1);
                        let index: number = range.index - word.length;

                        editComp.suggest.display = 'none';
                        editComp.word = editComp.suggest.value.title;
                        editComp.newLinkID = editComp.suggest.value.page_id;
                        editComp.range = { index: index, length: word.length };
                        editComp.createLink();
                        editComp.editor.quill.insertText(index + editComp.word.length, ' ', 'link', false);
                        editComp.editor.quill.setSelection(index + editComp.word.length + 1, 0);
                    } else {
                        return true;
                    }
                });
                editComp.editor.quill.keyboard.addBinding({
                    key: 'up'
                }, function (range, context) {
                    if (editComp.suggest.display === 'block') {
                        let index: number = editComp.suggest.value.index;
                        if (index > 0) {
                            editComp.suggest.value = editComp.suggest.options[--index].value;
                        }
                    } else {
                        return true;
                    }
                });
                editComp.editor.quill.keyboard.addBinding({
                    key: 'down'
                }, function (range, context) {
                    if (editComp.suggest.display === 'block') {
                        let index: number = editComp.suggest.value.index;
                        if (index < editComp.suggest.options.length - 1) {
                            editComp.suggest.value = editComp.suggest.options[++index].value;
                        }
                    } else {
                        return true;
                    }
                });
            } else {
                editComp.setHotkey(editComp);
            }
        }, 500);
    }

    /* ------------------------- Open Dialogs ------------------------- */
    public openLinkCreator(editor: EditComponent) {
        if (!editor) {
            editor = this;
        }

        editor.range = editor.editor.quill.getSelection();
        if (editor.range) {
            // Set the range and display the link creator
            editor.word = editor.editor.quill.getText(editor.range.index, editor.range.length);
            editor.range.index += editor.word.search(/\S|$/);
            editor.word = editor.word.trim();
            editor.range.length = editor.word.length;

            // Set the wiki pages in the dropdown
            editor.newLinkPages = [{ label: 'Create New Page', value: null }];
            editor.newSegments = [{
                label: editor.data.segment.title, value: editor.data.segment.segment_id
            }];
            editor.loopPages(editor, editor.data.segment, (page: PageSummary) => {
                editor.newLinkPages.push({ label: page.title, value: page.page_id });
            }, (seg: Segment) => {
                editor.newSegments.push({ label: seg.title, value: seg.segment_id });
            });
            editor.newLinkID = editor.newLinkPages[0].value;
            editor.newSegmentID = editor.newSegments[0].value;

            editor.displayLinkCreator = true;
        }
    }
    public openSectionCreator() {
        this.newSectionTitle = '';
        this.displaySectionCreator = true;
    }
    public openSectionRenamer() {
        this.renaming = true;
        this.newSectionTitle = this.data.section.data.title;
    }
    public openBookmarkCreator() {
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
    public openBookmarkRenamer() {
        this.bookmarkRenaming = true;
        this.newBookmark.name = this.bookmark.data.name;
    }

    // Link
    public createLink() {
        this.word = this.word.trim();
        if (this.newLinkID) {
            this.editor.quill.deleteText(this.range.index, this.range.length);

            this.editor.quill.insertText(
                this.range.index, this.word, 'link', 'new' + Math.random() + '-' + this.newLinkID.$oid);
            this.editor.quill.setSelection(this.range.index + this.word.length, 0);
            this.displayLinkCreator = false;
        } else {
            this.wikiService.addPage(this.word, this.newSegmentID, (reply: any) => {
                this.newLinkID = reply.page_id;
                this.createLink();
            });
        }
    }

    // Section
    public selectSection(event: any) {
        this.renaming = false;
        this.data.section = event.node;
        this.save();
        this.data.prevSection = event.node;
        this.apiService.refreshStoryContent(event.node.data.section_id, event.node.data.title);
    }
    public addSection() {
        this.displaySectionCreator = false;
        this.editService.addSection(this.data.section.data.section_id, this.newSectionTitle);
    }
    public renameStory(event: any) {
        this.renaming = false;
        event.stopPropagation();
        this.storyService.editStory(this.data.story.story_id, this.newSectionTitle);
    }
    public renameSection(event: any) {
        this.renaming = false;
        event.stopPropagation();
        this.editService.editSectionTitle(this.data.section.data.section_id, this.newSectionTitle);
    }
    public cancelRenameSection(event: any) {
        this.renaming = false;
        event.stopPropagation();
    }
    public deleteSection() {
        this.displaySectionDeleter = false;
        this.editService.deleteSection(this.data.section.data.section_id);
        this.selectSection({ node: this.data.section.parent });
    }

    // Bookmark
    public selectBookmark(event: any) {
        if (event.node.data.section_id) {
            this.bookmark = event.node;
            this.bookmarkRenaming = false;
            let bookmark: any = event.node.data;
            if (JSON.stringify(this.data.section.data.section_id) === JSON.stringify(bookmark.section_id)) {
                this.scrollToParagraph(bookmark.paragraph_id.$oid);
            } else {
                this.apiService.refreshStoryContent(bookmark.section_id, null, { paragraph_id: bookmark.paragraph_id });
            }
        } else {
            this.oldBookmark = this.bookmark;
        }
    }
    public addBookmark() {
        this.displayBookmarkCreator = false;
        this.editService.addBookmark(this.data.section.data.section_id, this.newBookmark.paragraphID, this.newBookmark.name, this.bookmark.data.index + 1);
    }
    public renameBookmark(event: any) {
        event.stopPropagation();
        this.bookmarkRenaming = false;
        this.editService.editBookmark(this.bookmark.data.bookmark_id, this.newBookmark.name);
    }
    public cancelRenameBookmark(event: any) {
        event.stopPropagation();
        this.bookmarkRenaming = false;
    }
    public deleteBookmark() {
        this.displayBookmarkDeleter = false;
        this.editService.deleteBookmark(this.bookmark.data.bookmark_id);
    }

    // -------------------- Other -------------------- //
    public loopPages(editor: EditComponent, segment: Segment,
        func: (page: PageSummary) => any, sFunc: (s: Segment) => any) {
        for (let page of segment.pages) {
            func(page);
        }
        for (let seg of segment.segments) {
            sFunc(seg);
            editor.loopPages(editor, seg, func, sFunc);
        }
    }

    public setContextMenu(node: TreeNode) {
        this.selectSection({ node: node });
        if (node.parent) {
            this.contextMenuItems = [
                { label: 'Rename Section', command: () => { this.openSectionRenamer(); } },
                { label: 'Delete Section', command: () => { this.displaySectionDeleter = true; } }
            ];
        } else {
            this.contextMenuItems = [{ label: 'Rename Story', command: () => { this.openSectionRenamer(); } }];
        }
        this.contextMenuItems.unshift({ label: 'Add Subsection', command: () => { this.openSectionCreator(); } });
    }

    public scrollToParagraph(paragraphID: string) {
        let paragraphs: any[] = this.editorRef.querySelectorAll('p');

        for (let paragraph of paragraphs) {
            if (paragraph.id === paragraphID) {
                let pBlot = Quill['find'](paragraph);
                let idx: number = this.editor.quill.getIndex(pBlot);
                this.editor.quill.setSelection(idx, 0);
                break;
            }
        }
    }

    public addNote() {
        let idx = this.editor.quill.getSelection(true);
        if (idx) {
            let blot = this.editor.quill.getLine(idx.index);
            if (blot) {
                let block = blot[0];
                while (block && block.domNode && !block.domNode.id && block.parent) {
                    block = block.parent;
                }
                if (block && block.domNode && block.domNode.id) {
                    this.editService.setNote(this.data.section.data.section_id, { $oid: block.domNode.id }, 'Testing');
                }
            }
        }
    }

    public save() {
        if (!this.data.inflight) {
            let paragraphs: any[] = this.editorRef.querySelectorAll('p');

            if (paragraphs.length > 0) {
                let newContentObject: any = this.parserService.parseHtml(paragraphs);
                this.editService.compare(this.data.contentObject, newContentObject,
                    this.data.story.story_id, this.data.prevSection.data.section_id);
            }
        }
    }

    // Drag and drop
    public onDragStart(event: any, node: TreeNode) {
        console.log('drag started');
        console.log(event);
        console.log(node);
    }

    public onDragEnd(event: any, node: TreeNode) {
        console.log('drag ended');
        console.log(event);
        console.log(node);
    }

    public onDrop(event: any, node: TreeNode) {
        console.log('dropped');
        console.log(event);
        console.log(node);
    }
}
