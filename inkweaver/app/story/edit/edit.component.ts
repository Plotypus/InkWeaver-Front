import {
    Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { Editor, Dialog, TreeNode, MenuItem } from 'primeng/primeng';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { UserService } from '../../user/user.service';
import { ApiService } from '../../shared/api.service';
import { ParserService } from '../../shared/parser.service';

import { ID } from '../../models/id.model';
import { Link } from '../../models/link/link.model';
import { Segment } from '../../models/wiki/segment.model';
import { PageSummary } from '../../models/wiki/page-summary.model';

@Component({
    selector: 'edit',
    templateUrl: './app/story/edit/edit.component.html'
})
export class EditComponent {
    @ViewChild(Editor) editor: Editor;
    @ViewChild(Dialog) dialog: Dialog;

    private data: any;
    private setLinks: boolean;
    private wordCount: number;
    private inputRef: any;
    private editorRef: any;
    private timerSub: Subscription;
    private paragraphPosition: ID;

    // Creating links
    private range: any;
    private word: string;
    private newLinkID: ID;
    private newLinkPages: any;
    private newSegmentID: ID;
    private newSegments: any;
    private displayLinkCreator: boolean;

    // Adding/editing sections
    private newSectionID: ID;
    private items: MenuItem[];
    private sectionTitle: string;
    private displaySectionEditor: boolean;
    private displaySectionCreator: boolean;

    private suggest: any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private userService: UserService,
        private apiService: ApiService,
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.suggest = {};
        this.data = this.apiService.data;
        this.data.tooltip.display = 'none';
        let timer: Observable<number> = Observable.timer(5000, 5000);
        this.timerSub = timer.subscribe((tick: number) => {
            if (this.router.url == '/story/edit') {
                let idx = this.editor.quill.getSelection(true);
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
            }
        });

        if (this.apiService.messages) {
            // Subscribe to observables
            this.apiService.messages.subscribe((action: string) => {
                if (action == 'get_section_content') {
                    this.setLinks = true;
                }
            });
        } else {
            this.router.navigate(['/login']);
        }
    }

    ngAfterViewInit() {
        // Initialize variables
        this.setLinks = true;
        this.inputRef = this.dialog.el.nativeElement.querySelector('input');
        this.editorRef = this.editor.el.nativeElement.querySelector('div.ql-editor');

        // Add click event handlers to links when necessary
        this.editor.onTextChange.subscribe((event: any) => {
            if (this.data.story.position_context && this.data.story.position_context.paragraph_id) {
                this.scrollToParagraph(this.data.story.position_context.paragraph_id.$oid);
                this.data.story.position_context = null;
            }

            this.suggest.display = 'none';

            let index: number = event.delta.ops[0].retain;
            if (index) {
                let text: string = this.editor.quill.getText(0, index + 1);
                let predict: string = text.slice(text.lastIndexOf(' ') + 1);

                if (predict) {
                    this.loopPages(this, this.data.segment, (page: PageSummary) => {
                        if (page.title.startsWith(predict)) {
                            let bounds = this.editor.quill.getBounds(index);
                            let top: number = bounds.top + 70;
                            this.suggest = {
                                title: page.title, page_id: page.page_id,
                                display: 'block', top: top + 'px', left: bounds.left + 'px'
                            };
                        }
                    }, (seg: Segment) => { });
                }
            }

            if (this.setLinks) {
                this.setLinks = false;

                let threads: any[] = this.editorRef.querySelectorAll('a[href]');
                for (let thread of threads) {
                    let linkID: string = thread.getAttribute('href');
                    if (linkID.startsWith('sid')) {
                        let id: string = linkID.substring(3);
                        let node: TreeNode = this.parserService.setSection(this.data.storyNode[0], JSON.stringify({ $oid: id }))
                        thread.addEventListener('click', (event: any) => {
                            event.preventDefault();
                            this.selectSection({ node: node });
                        });
                    } else {
                        let ids: string[] = linkID.split('-');
                        let pageID: ID = { $oid: ids[1] };

                        thread.addEventListener('click', (event: any) => {
                            event.preventDefault();
                            this.wikiService.getWikiPage(pageID);
                            this.router.navigate(['/story/wiki']);
                        });
                        thread.addEventListener('mouseenter', (event: any) => {
                            let top: number = event.target.offsetTop + 70;
                            this.data.tooltip = {
                                text: '',
                                display: 'block', top: top + 'px', left: event.target.offsetLeft + 'px'
                            };
                            this.wikiService.getWikiPage(pageID, { noflight: true });
                        });
                        thread.addEventListener('mouseleave', (event: any) => {
                            this.data.tooltip.display = 'none';
                        });
                    }
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });

        this.setHotkey(this);
    }

    ngOnDestroy() {
        this.timerSub.unsubscribe();
        this.data.story.position_context = { section_id: this.data.section.data.section_id, paragraph_id: this.paragraphPosition };
        this.userService.setUserStoryPositionContext(this.data.story.story_id, this.data.section.data.section_id, this.paragraphPosition);
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
                }, function () { editComp.openLink(editComp) });

                delete editComp.editor.quill.keyboard.bindings['9'];
                editComp.editor.quill.keyboard.addBinding({
                    key: 'tab'
                }, function (range, context) {
                    if (editComp.suggest.display == 'block') {
                        let word: string = context.prefix.slice(context.prefix.lastIndexOf(' ') + 1);
                        let index: number = range.index - word.length;

                        editComp.suggest.display = 'none';
                        editComp.newLinkID = editComp.suggest.page_id;
                        editComp.word = editComp.suggest.title;
                        editComp.range = { index: index, length: word.length };
                        editComp.createLink();
                        editComp.editor.quill.insertText(index + editComp.word.length, ' ', 'link', false);
                        editComp.editor.quill.setSelection(index + editComp.word.length + 1, 0);
                    }
                });
            } else {
                editComp.setHotkey(editComp);
            }
        }, 500);
    }

    /* ------------------------- Create Link ------------------------- */
    public showDialog() {
        this.inputRef.focus();
    }

    public openLink(editor: EditComponent) {
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

            editor.editor.quill.disable();
            editor.displayLinkCreator = true;
            editor.changeDetectorRef.detectChanges();
        }
    }

    public hideDialog() {
        this.editor.quill.enable();
    }

    public createLink() {
        this.word = this.word.trim();
        if (this.newLinkID) {
            this.editor.quill.enable();
            this.editor.quill.deleteText(this.range.index, this.range.length);

            this.setLinks = true;
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

    // -------------------- Select, Add, and Edit Sections -------------------- //
    public selectSection(event: any) {
        this.data.section = event.node;
        this.save();
        this.data.prevSection = event.node;
        this.data.storyDisplay = '';
        this.editService.getSectionContent(event.node.data.section_id, event.node.data.title);
    }

    public addSection() {
        this.editService.addSection(this.sectionTitle, this.newSectionID);
        this.sectionTitle = '';
        this.newSectionID = new ID();
        this.displaySectionCreator = false;
    }

    public editSectionTitle() {
        this.editService.editSectionTitle(this.sectionTitle, this.newSectionID);
        this.sectionTitle = '';
        this.newSectionID = new ID();
        this.displaySectionEditor = false;
    }

    // Context Menu
    public setContextMenu(node: TreeNode) {
        this.selectSection({ node: node });
        this.items = [
            {
                label: 'Rename',
                command: () => {
                    this.newSectionID = node.data.section_id;
                    this.displaySectionEditor = true;
                }
            },
            {
                label: 'Add Subsection',
                command: () => {
                    this.newSectionID = node.data.section_id;
                    this.displaySectionCreator = true;
                }
            }
        ];

        if (node.parent) {
            this.items.push({
                label: 'Delete Section', command: () => {
                    this.selectSection({ node: node.parent });
                    this.editService.deleteSection(node.data.section_id);
                }
            });
        }
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

    public scrollToParagraph(paragraphID: string) {
        let paragraphs: any[] = this.editorRef.querySelectorAll('p');

        for (let paragraph of paragraphs) {
            if (paragraph.id == paragraphID) {
                let pBlot = Quill['find'](paragraph);
                let idx: number = this.editor.quill.getIndex(pBlot);
                this.editor.quill.setSelection(idx, 0);
                break;
            }
        }
    }

    public save() {
        if (!this.data.inflight) {
            let paragraphs: any[] = this.editorRef.querySelectorAll('p');

            if (paragraphs.length > 0) {
                let newContentObject: any = this.parserService.parseHtml(paragraphs);
                this.editService.compare(this.data.contentObject, newContentObject, this.data.story.story_id, this.data.prevSection.data.section_id);
            }
        }
    }
}
