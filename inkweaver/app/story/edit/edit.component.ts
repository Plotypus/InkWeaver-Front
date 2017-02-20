import {
    Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { Editor, Dialog, TreeNode, MenuItem } from 'primeng/primeng';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
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

    // Creating links
    private range: any;
    private word: string;
    private newLinkId: ID;
    private newLinkPages: any;
    private displayLinkCreator: boolean;

    // Adding/editing sections
    private newSectionId: ID;
    private items: MenuItem[];
    private sectionTitle: string;
    private displaySectionEditor: boolean;
    private displaySectionCreator: boolean;

    private suggest: any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.suggest = {};
        this.data = this.apiService.data;
        this.data.tooltip.display = 'none';
        //let timer = Observable.timer(5000, 5000);
        //timer.subscribe((tick: number) => this.save());

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
                    });
                }
            }

            if (this.setLinks) {
                this.setLinks = false;

                let threads: any[] = this.editorRef.querySelectorAll('a[href]');
                for (let thread of threads) {
                    thread.addEventListener('click', (event: any) => {
                        event.preventDefault();
                        let linkId: string = thread.getAttribute('href');
                        let ids: string[] = linkId.split('-');
                        let pageId: any = { $oid: ids[1] };
                        this.wikiService.getWikiPage(pageId);
                        this.router.navigate(['/story/wiki']);
                    });
                    thread.addEventListener('mouseenter', (event: any) => {
                        let top: number = event.target.offsetTop + 70;
                        this.data.tooltip = {
                            text: '',
                            display: 'block', top: top + 'px', left: event.target.offsetLeft + 'px'
                        };
                        let linkId: string = thread.getAttribute('href');
                        let ids: string[] = linkId.split('-');
                        let pageId: any = { $oid: ids[1] };
                        this.wikiService.getWikiPage(pageId, { noflight: true });
                    });
                    thread.addEventListener('mouseleave', (event: any) => {
                        this.data.tooltip.display = 'none';
                    });
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });

        this.setHotkey(this);
    }

    ngOnDestroy() {
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
                        editComp.newLinkId = editComp.suggest.page_id;
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
            editor.newLinkPages = [];
            editor.loopPages(editor, editor.data.segment, (page: PageSummary) => {
                editor.newLinkPages.push({ label: page.title, value: page.page_id });
            });
            editor.newLinkId = editor.newLinkPages[0].value;

            editor.editor.quill.disable();
            editor.displayLinkCreator = true;
            editor.changeDetectorRef.detectChanges();
        }
    }

    public hideDialog() {
        this.editor.quill.enable();
    }

    public createLink() {
        this.editor.quill.enable();
        this.word = this.word.trim();
        this.editor.quill.deleteText(this.range.index, this.range.length);

        this.setLinks = true;
        this.editor.quill.insertText(
            this.range.index, this.word, 'link', 'new' + Math.random() + '-' + this.newLinkId.$oid);
        this.editor.quill.setSelection(this.range.index + this.word.length, 0);
        this.displayLinkCreator = false;
    }

    // -------------------- Select, Add, and Edit Sections -------------------- //
    public selectSection(event: any) {
        this.save();
        this.data.prevSection = event.node;
        this.data.storyDisplay = '';
        this.editService.getSectionContent(event.node.data.section_id);
    }

    public addSection() {
        this.editService.addSection(this.sectionTitle, this.newSectionId);
        this.sectionTitle = '';
        this.newSectionId = new ID();
        this.displaySectionCreator = false;
    }

    public editSectionTitle() {
        this.editService.editSectionTitle(this.sectionTitle, this.newSectionId);
        this.sectionTitle = '';
        this.newSectionId = new ID();
        this.displaySectionEditor = false;
    }

    // Context Menu
    public setContextMenu(node: TreeNode) {
        this.data.section = node;
        this.data.prevSection = node;
        this.selectSection({ node: node });
        this.items = [
            {
                label: 'Rename',
                command: () => {
                    this.newSectionId = node.data.section_id;
                    this.displaySectionEditor = true;
                }
            },
            {
                label: 'Add Subsection',
                command: () => {
                    this.newSectionId = node.data.section_id;
                    this.displaySectionCreator = true;
                }
            }
        ];

        if (node.parent) {
            this.items.push({
                label: 'Delete Section', command: () => {
                    this.data.section = node.parent;
                    this.data.prevSection = node.parent;
                    this.selectSection({ node: node.parent });
                    this.editService.deleteSection(node.data.section_id);
                }
            });
        }
    }

    // -------------------- Other -------------------- //
    public loopPages(editor: EditComponent, segment: Segment, func: (page: PageSummary) => any) {
        for (let page of segment.pages) {
            func(page);
        }
        for (let seg of segment.segments) {
            editor.loopPages(editor, seg, func);
        }
    }

    public save() {
        let paragraphs: any[] = this.editorRef.querySelectorAll('p');

        let newContentObject: any = this.parserService.parseHtml(paragraphs);
        this.editService.compare(this.data.contentObject, newContentObject, this.data.story.story_id, this.data.prevSection.data.section_id);
    }
}
