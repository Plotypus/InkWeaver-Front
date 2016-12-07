import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Editor } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';
import { EditService } from './edit.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    @ViewChild(Editor) editor: Editor;
    private data: any;

    constructor(
        private editService: EditService,
        private parser: ParserService,
        private elRef: ElementRef,
        private router: Router) {

        this.data = parser.data;
        parser.receive().subscribe(response => this.clickableLinks());

        editService.getUserInfo();
    }

    public switchChapter(event: any) {
        this.editService.loadChapterWithParagraphs(event.data.id);
    }

    public clickableLinks() {
        let threads = this.elRef.nativeElement.querySelectorAll('a');
        for (let thread of threads) {
            thread.removeEventListener('click', (event: any) => {
                event.stopPropagation();
                this.router.navigate(['/wiki']);
            });
            thread.addEventListener('click', (event: any) => {
                event.preventDefault();
                this.router.navigate(['/wiki']);
            });
        }
    }

    public followLink(event: any) {

    }
}
