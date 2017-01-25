import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { Dialog } from 'primeng/primeng';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ParserService } from '../../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/story/edit/edit.component.html'
})
export class EditComponent {
    @ViewChild(Editor) editor: Editor;
    @ViewChild(Dialog) dialog: Dialog;

    private data: any;
    private content: any;
    private inputRef: any;
    private editorRef: any;
    private tooltipRef: any;
    private setLinks: boolean;
    private wordCount: number;

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
        private parserService: ParserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.data = this.parserService.data;
        this.content = '<p>Hello, my name is <a href="http://www.google.com">Kyle</a></p>';
        this.data.storyNode = [{
            data: { title: 'My Cool Story', section_id: '' },
            children: [
                {
                    data: { title: 'Section 1', section_id: '' },
                    children: [
                        {
                            data: { title: 'Chapter 1', section_id: '' },
                            leaf: true
                        }
                    ],
                    leaf: false
                },
                {
                    data: { title: 'Section 2', section_id: '' },
                    leaf: true
                }
            ],
            leaf: false
        }];

        // if (!(this.data.inflight || this.data.story.story_title)) {
        //     this.router.navigate(['/user']);
        // }
    }

    public turn(event: any) {
        let node = event.target;

        while (node.tagName != 'DIV') {
            node = node.parentElement;
        }

        if (!node.className.startsWith('cke_editable')) {
            CKEDITOR.inline(node);
        }
    }

    public selectSection(event: any) {
        this.editService.getSectionContent(event.node.data.section_id);
    }
}
