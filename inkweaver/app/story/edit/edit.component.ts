import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { Dialog } from 'primeng/primeng';
import { TreeNode } from 'primeng/primeng';
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
    private inputRef: any;
    private editorRef: any;
    private setLinks: boolean;
    private wordCount: number;
    private selectedSection: TreeNode;

    // For creating links
    private range: any;
    private word: string;
    private newLinkId: any;
    private newLinkPages: any;
    private displayLinkCreator: boolean;

    private displaySectionCreator: boolean;
    private sectionTitle: string;
    private newSectionId: ID;

    private suggest: any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.suggest = {};
        this.data.tooltip.display = 'none';
        //let values: string[] = Object.values(this.data.outgoing);
        //values.includes('get_story_hierarchy')

        if (!(this.data.inflight || this.data.story.story_title)) {
            this.router.navigate(['/login']);
        }

        // Subscribe to observables
        this.apiService.messages.subscribe((action: string) => {
            if (action == 'get_section_content') {
                this.setLinks = true;
            }
        });
    }

    ngAfterViewInit() {
        // Initialize variables
        this.setLinks = true;
        this.inputRef = this.dialog.domHandler.findSingle(
            this.dialog.el.nativeElement, 'input')
        this.editorRef = this.editor.domHandler.findSingle(
            this.editor.el.nativeElement, 'div.ql-editor');

        // Add click event handlers to links when necessary
        this.editor.onTextChange.subscribe((event: any) => {
            this.suggest.display = 'none';

            let index = event.delta.ops[0].retain;
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

                let threads = this.editor.domHandler.find(this.editorRef, 'a[href]');
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
                        this.wikiService.getWikiPage(pageId, 'edit');
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

    /* ------------------------- Dialog ------------------------- */
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

    public loopPages(editor: EditComponent, segment: Segment, func: (page: PageSummary) => any) {
        for (let page of segment.pages) {
            func(page);
        }
        for (let seg of segment.segments) {
            editor.loopPages(editor, seg, func);
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

    /* ------------------------------------------------------------ */

    public selectSection(event: any) {
        this.data.section.section_id = event.node.data.section_id;
        if (event.node.parent) {
            this.data.storyDisplay = '';
            this.editService.getSectionContent(event.node.data.section_id);
        } else {
            this.data.storyDisplay = '<h1>Summary</h1>' + this.data.story.summary;
        }
    }

    public save() {
        let newContentObject: any = this.parserService.parseHtml(this.editorRef.innerHTML);
        this.editService.compare(this.data.contentObject, newContentObject, this.data.story.story_id, this.data.section.section_id);
    }

    /* ------------------------------------------------------------ */

    public addSection() {
        this.editService.addSection(this.sectionTitle, this.newSectionId);
        this.displaySectionCreator = false;
    }

    public openSectionCreator(sectionId: ID) {
        this.newSectionId = sectionId;
        this.displaySectionCreator = true;
    }

    public deleteSection(sectionId: ID) {
        //this.editService.deleteSection(sectionId);
    }
}
