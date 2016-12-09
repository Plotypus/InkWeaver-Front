import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';
import { ConfirmationService } from 'primeng/primeng';

import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    @ViewChild(Editor) editor: Editor;

    private data: any;
    private range: any;
    private newLink: any;
    private wikiPages: any;
    private editorRef: any;
    private wordCount: number;
    private setLinks: boolean;
    private displayLink: boolean;

    constructor(
        private router: Router,
        private elRef: ElementRef,
        private parser: ParserService,
        private editService: EditService,
        private wikiService: WikiService,
        private confService: ConfirmationService) { }

    ngOnInit() {
        // Initialize variables
        this.setLinks = true;
        this.data = this.parser.data;
        this.editorRef = this.elRef.nativeElement.querySelector('.ui-editor-content');
        this.wikiPages = [
            { label: 'Arthur Dent', value: { id: 'h2g2_wiki_page_1' } },
            { label: 'Ford Prefect', value: { id: 'h2g2_wiki_page_2' } },
            { label: 'Earth', value: { id: 'h2g2_wiki_page_3' } },
        ];
        this.newLink = this.wikiPages[0].value;

        // Subscribe to observables
        this.parser.receive().subscribe((action: string) => {
            if (action == 'load_chapter_with_paragraphs' || action == 'get_all_paragraphs')
                this.setLinks = true;
        });
        this.editor.onTextChange.subscribe((event: any) => {
            if (this.setLinks) {
                this.setLinks = false;
                let threads = this.editorRef.querySelectorAll('a[href]');

                for (let thread of threads) {
                    thread.addEventListener('click', (event: any) => {
                        event.preventDefault();
                        this.wikiService.loadWikiPageWithSections(thread.getAttribute('href'));
                        this.router.navigate(['/wiki']);
                    });
                }
            }
            this.wordCount = event.textValue.split(/\s+/).length;
        });

        // If story isn't loaded, load it
        if (this.data.story.id == '') this.editService.getUserInfo();
    }

    public selectStory() {
        this.data.storySelected = true;
        this.parser.setStoryDisplay();
        this.data.selectedChapter = { 'id': '', 'title': '' };
    }

    public switchChapter(event: any) {
        this.data.storySelected = false;
        this.editService.loadChapterWithParagraphs(event.data.id);
    }

    public openLink() {
        this.displayLink = true
        this.range = this.editor.quill.getSelection();
    }

    public createLink() {
        this.setLinks = true;
        this.displayLink = false;
        this.editor.quill.formatText(this.range.index, this.range.length, 'link', this.newLink.id);
    }
}
