import { Component } from '@angular/core';
import { EditService } from './edit.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private paragraph: string;
    private replies: string[];

    constructor(private editService: EditService, private parser: ParserService) {
        console.log(parser.replies);
        this.replies = parser.replies;
    }

    private saveParagraph() {
        this.parser.send(this.paragraph);
    }
}
