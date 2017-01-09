import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { Dialog } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';
import { Chapter } from '../models/chapter.model';

import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
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
    private displayLinkCreator: boolean;

    private range: any;
    private word: string;
    private newLinkId: any;
    private newLinkPages: any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        let editComponent = this;
        editComponent.data = editComponent.parserService.data;
    }

    ngAfterViewInit() {
        // Initialize variables
        let editComponent = this;
        editComponent.setLinks = true;

        editComponent.inputRef = editComponent.dialog.domHandler.findSingle(
            editComponent.dialog.el.nativeElement, "input")
        editComponent.editorRef = editComponent.editor.domHandler.findSingle(
            editComponent.editor.el.nativeElement, 'div.ql-editor');
        editComponent.tooltipRef = editComponent.editor.domHandler.findSingle(
            editComponent.editor.el.nativeElement, 'div.ql-tooltip');

        // Add click event handlers to links when necessary
        editComponent.editor.onTextChange.subscribe((event: any) => {
            if (editComponent.setLinks) {
                editComponent.setLinks = false;
                let threads = editComponent.editor.domHandler.find(
                    editComponent.editorRef, 'a[href]');

                for (let thread of threads) {
                    thread.addEventListener('click', (event: any) => {
                        event.preventDefault();
                        let pageId: string = thread.getAttribute('href');
                        editComponent.wikiService.loadWikiPageWithSections(JSON.parse(pageId));
                        editComponent.router.navigate(['/wiki']);
                    });
                    thread.addEventListener('mouseenter', (event: any) => {
                        editComponent.tooltipRef.innerHTML = thread.innerHTML;

                        editComponent.tooltipRef.style.visibility = 'visible';
                        editComponent.tooltipRef.classList.remove('ql-hidden');
                        editComponent.tooltipRef.classList.remove('ql-editing');

                        let top: number = event.target.offsetTop + 10;
                        editComponent.tooltipRef.style.top = top + 'px';
                        editComponent.tooltipRef.style.left = event.target.offsetLeft + 'px';
                    });
                    thread.addEventListener('mouseleave', (event: any) => {
                        editComponent.tooltipRef.style.visibility = 'hidden';
                        editComponent.tooltipRef.classList.add('ql-hidden');
                    });
                }
            }
            editComponent.wordCount = event.textValue.split(/\s+/).length;
        });

        // Add hotkey for creating links (Alt+L)
        editComponent.editor.quill.keyboard.addBinding({
            key: 'L',
            altKey: true
        }, function () { editComponent.openLink(editComponent) });

        // Subscribe to observables
        editComponent.parserService.receive().subscribe((action: string) => {
            if (action == 'load_chapter_with_paragraphs' || action == 'get_all_paragraphs') {
                editComponent.setLinks = true;
            }
        });

        // If story isn't loaded, load it
        if (!editComponent.data.story.title) {
            editComponent.editService.getUserInfo();
        }
    }

    /**
     * Selects a story
     */
    public selectStory() {
        this.parserService.setStoryDisplay();
    }

    /**
     * Loads the chapter content for a specific chapter
     * @param event - The click event associated with clicking on a chapter
     */
    public selectChapter(event: any) {
        this.data.storySelected = false;
        this.editService.loadChapterWithParagraphs(event.data.id);
    }

    /**
     * Opens the link creator
     */
    public openLink(editor: any) {
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
            editor.newLinkId = 0;
            editor.newLinkPages = [];
            if (editor.data.wiki.segments) {
                for (let segment of editor.data.wiki.segments) {
                    for (let page of segment.pages) {
                        editor.newLinkPages.push({ label: page.title, value: { id: page.id } });
                        if (editor.newLinkId === 0) {
                            editor.newLinkId = page;
                        }
                    }
                }
            }

            this.editor.quill.disable();
            editor.displayLinkCreator = true;
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * Creates a link
     */
    public createLink() {
        this.editor.quill.enable();
        this.editor.quill.deleteText(this.range.index, this.range.length);

        this.setLinks = true;
        this.editor.quill.insertText(this.range.index, this.word, 'link', JSON.stringify(this.newLinkId.id));
        this.editor.quill.setSelection(this.range.index + this.word.length, 0);
        this.displayLinkCreator = false;
    }

    public showDialog() {
        this.inputRef.focus();
    }

    public hideDialog() {
        this.editor.quill.enable();
    }
}
