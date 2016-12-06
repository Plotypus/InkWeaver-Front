import { Component } from '@angular/core';

import { MenuItem } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';

@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
})
export class WikiComponent {
    private wiki_pages: any;
    private chapters: MenuItem[];
    private tabs: any;
    private page: string;

    constructor(private wikiService: WikiService, private parser: ParserService) {
        this.wiki_pages = {
            'Luke Walker': ' &lt;em&gt;hello&lt;em&gt; Luke Skywalker and <em>Ben Kenobi<em> decided to go to the local spaceport, Mos Eisley, to find a pilot. The trip was uneventful. As they arrived, Ben exclaimed "Never before have I seen a more wretched hive of scum and villainy."',
            'Ben Kenobi': 'Back at home, Luke asked Ben what he should do about the cute girl he had met in school the previous day, but Ben seemed to not want to talk about it.',
            'Planet A': 'This is Planet A',
            'Planet B': ''
        };

        this.page = this.wiki_pages['Luke Walker'];
        this.tabs = [{
            id: 1,
            header: 'Characters',
            items: [{
                label: "Luke Walker", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            },
            {
                label: "Ben Kenobi", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            }
            ]
        }, {
            id: 2,
            header: 'Places',
            items: [{
                label: "Planet A", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            },
            {
                label: "Planet B", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            }
            ]
        }];
    }
}
