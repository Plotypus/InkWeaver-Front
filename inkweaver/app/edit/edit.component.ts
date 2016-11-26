import { Component } from '@angular/core';
import { EditService } from './edit.service';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private message: string = '';
    private messages: string[] = [];

    constructor(private editService: EditService) {
        editService.messages.subscribe(msg => {
            this.messages.push(msg);
        });
    }

    private sendMessage() {
        this.editService.messages.next(this.message);
    }
}
