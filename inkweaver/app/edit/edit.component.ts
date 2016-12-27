import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { Chapter } from '../models/chapter.model';
import { ConfirmationService } from 'primeng/primeng';

import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private data: any;
    private display: string;

    private newLinkId: any;
    private newLinkPages: any;
    private displayLinkCreator: boolean;

    constructor(
        private router: Router,
        private parser: ParserService,
        private editService: EditService,
        private wikiService: WikiService,
        private confService: ConfirmationService) { }

    ngOnInit() {
        this.data = this.parser.data;
        this.newLinkPages = [
            { label: 'Arthur Dent', value: { id: 'h2g2_wiki_page_1' } },
            { label: 'Ford Prefect', value: { id: 'h2g2_wiki_page_2' } },
            { label: 'Earth', value: { id: 'h2g2_wiki_page_3' } },
        ];
        this.newLinkId = this.newLinkPages[0].value;

        // If story isn't loaded, load it
        if (this.data.story.id === '') {
            this.editService.getUserInfo();
        };

        this.display = '<button onclick="alert(\'Hello\')">Hello</button>';
    }

    /**
     * Selects a story
     */
    public selectStory() {
        this.data.storySelected = true;
        this.data.selectedChapter = new Chapter();
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
    public openLinkCreator() {
        this.displayLinkCreator = true;
    }

    /**
     * Creates a link
     */
    public createLink() {
        this.displayLinkCreator = false;
    }
}
