import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';
import { EditService } from './edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private data: any;
    @ViewChild(Editor) editor: Editor;

    constructor(
        private router: Router,
        private elRef: ElementRef,
        private parser: ParserService,
        private editService: EditService,
        private wikiService: WikiService) {

        this.data = parser.data;
        parser.receive().subscribe((action: string) => {
            if (action == 'load_chapter_with_paragraphs' || action == 'get_all_paragraphs')
                this.clickableLinks();
        });

        if (this.data.story.id == '') {
            editService.getUserInfo();
        }
    }

    public switchChapter(event: any) {
        this.editService.loadChapterWithParagraphs(event.data.id);
    }

    public clickableLinks() {
        let threads: Element[] = this.elRef.nativeElement.querySelectorAll('a[href]');
        for (let thread of threads) {
            thread.addEventListener('click', (event: any) => {
                event.preventDefault();
                this.router.navigate(['/wiki']);
            });
        }
    }
}
