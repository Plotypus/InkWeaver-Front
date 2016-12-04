import { Component } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { EditService } from './edit.service';
import { ParserService } from '../shared/parser.service';

import { Chapter } from '../models/chapter.model';

@Component({
    selector: 'edit',
    templateUrl: './app/edit/edit.component.html'
})
export class EditComponent {
    private paragraphs: any;
    private paragraph: string;
    private replies: string[];
    private chapters: MenuItem[];

    constructor(private editService: EditService, private parser: ParserService) {
        this.paragraphs = {
            'Chapter 1': 'Luke Skywalker and Ben Kenobi decided to go to the local spaceport, Mos Eisley, to find a pilot. The trip was uneventful. As they arrived, Ben exclaimed "Never before have I seen a more wretched hive of scum and villainy."',
            'Chapter 2': 'Back at home, Luke asked Ben what he should do about the cute girl he had met in school the previous day, but Ben seemed to not want to talk about it.',
            'Chapter 3': ''
        };
        this.paragraph = this.paragraphs['Chapter 1'];
        this.chapters = [{
            label: 'Mos Eisley Trip', items: [
                {
                    label: 'Chapter 1',
                    command: (event: any) => {
                        let chapter: string = event.item.label;
                        this.paragraph = this.paragraphs[chapter];
                    }
                },
                {
                    label: 'Chapter 2', command: (event: any) => {
                        let chapter: string = event.item.label;
                        this.paragraph = this.paragraphs[chapter];
                    }
                },
                {
                    label: 'Chapter 3', command: (event: any) => {
                        let chapter: string = event.item.label;
                        this.paragraph = this.paragraphs[chapter];
                    }
                }
            ]
        }];
        this.replies = parser.replies;
    }

    private saveParagraph() {
        this.parser.send(this.paragraph);
    }
}
