import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { EditService } from './edit.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private data: any;

    constructor(private editService: EditService, private parser: ParserService) {
        this.data = parser.data;
        editService.getUserInfo();
    }

    public switchChapter(event: any) {
        this.editService.loadChapterWithParagraphs(event.data.id);
    }
}
