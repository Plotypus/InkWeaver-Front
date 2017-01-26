import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { Dialog } from 'primeng/primeng';
import { TreeNode } from 'primeng/primeng';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ApiService } from '../../shared/api.service';
import { ParserService } from '../../shared/parser.service';

import { Segment } from '../../models/segment.model';

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
    private tooltipRef: any;
    private setLinks: boolean;
    private wordCount: number;
    private selectedSection: TreeNode;

    // For creating links
    private range: any;
    private word: string;
    private newLinkId: any;
    private newLinkPages: any;
    private displayLinkCreator: boolean;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.data = this.apiService.data;
        //let values: string[] = Object.values(this.data.outgoing);
        //values.includes('get_story_hierarchy')

        if (!(this.data.inflight || this.data.story.story_title)) {
            this.router.navigate(['/login']);
        }
    }

    ngAfterViewInit() {
        // Initialize variables
        this.setLinks = true;

        this.inputRef = this.dialog.domHandler.findSingle(
            this.dialog.el.nativeElement, 'input')
        this.editorRef = this.editor.domHandler.findSingle(
            this.editor.el.nativeElement, 'div.ql-editor');
        this.tooltipRef = this.editor.domHandler.findSingle(
            this.editor.el.nativeElement, 'div.ql-tooltip');

        // Add click event handlers to links when necessary
        this.editor.onTextChange.subscribe((event: any) => {
            if (this.setLinks) {
                this.setLinks = false;
                let threads = this.editor.domHandler.find(this.editorRef, 'a[href]');

                for (let thread of threads) {
                    thread.addEventListener('click', (event: any) => {
                        event.preventDefault();
                        let pageId: string = thread.getAttribute('href');
                        this.wikiService.getWikiPage(pageId);
                        this.router.navigate(['/story/wiki']);
                    });
                    thread.addEventListener('mouseenter', (event: any) => {
                        this.tooltipRef.innerHTML = thread.innerHTML;

                        this.tooltipRef.style.visibility = 'visible';
                        this.tooltipRef.classList.remove('ql-hidden');
                        this.tooltipRef.classList.remove('ql-editing');

                        let top: number = event.target.offsetTop + 10;
                        this.tooltipRef.style.top = top + 'px';
                        this.tooltipRef.style.left = event.target.offsetLeft + 'px';
                    });
                    thread.addEventListener('mouseleave', (event: any) => {
                        this.tooltipRef.style.visibility = 'hidden';
                        this.tooltipRef.classList.add('ql-hidden');
                    });
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });

        // Add hotkey for creating links (Alt+L)
        let editComp: EditComponent = this;
        this.editor.quill.keyboard.addBinding({
            key: 'L',
            altKey: true
        }, function () { editComp.openLink(editComp) });

        // Subscribe to observables
        this.apiService.messages.subscribe((action: string) => {
            if (action == 'get_section_content') {
                this.setLinks = true;
            }
        });
    }

    public selectSection(event: any) {
        this.editService.getSectionContent(event.node.data.section_id);
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
            editor.populateLinkPages(editor, editor.data.segment);
            editor.newLinkId = editor.newLinkPages[0].value;

            editor.editor.quill.disable();
            editor.displayLinkCreator = true;
            editor.changeDetectorRef.detectChanges();
        }
    }

    public createLink() {
        this.editor.quill.enable();
        this.editor.quill.deleteText(this.range.index, this.range.length);

        this.setLinks = true;
        this.editor.quill.insertText(
            this.range.index, this.word, 'link', JSON.stringify(this.newLinkId));
        this.editor.quill.setSelection(this.range.index + this.word.length, 0);
        this.displayLinkCreator = false;
    }

    public populateLinkPages(editor: EditComponent, segment: Segment) {
        for (let page of segment.pages) {
            editor.newLinkPages.push({ label: page.title, value: page.page_id });
        }
        for (let seg of segment.segments) {
            editor.populateLinkPages(editor, seg);
        }
    }

    public showDialog() {
        this.inputRef.focus();
    }

    public hideDialog() {
        this.editor.quill.enable();
    }

    public save() { }
}
