import { Component } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { Router } from '@angular/router';

import { EditService } from '../edit/edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ApiService } from '../../shared/api.service';
import { PageSummary } from '../../models/wiki/page-summary.model';
@Component({
    selector: 'stats',
    templateUrl: './app/story/stats/stats.component.html'
})
export class StatsComponent {

    private data: any;
    private wordFreq: any;
    private statData: any;
    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService
    ) { }

    ngOnInit(){
        this.data = this.apiService.data;
        let json = `{"statistics" : {
        "word_frequency" : {
            "A" : 1,
            "Christmas" : 5,
            "Carol" : 1,
            "is" : 5,
            "a" : 3,
            "novella" : 1,
            "by" : 2,
            "Charles" : 1,
            "Dickens" : 1,
            "about" : 1,
            "Ebenezer" : 1,
            "Scrooge" : 3,
            "an" : 1,
            "old" : 2,
            "man" : 1,
            "who" : 1,
            "well-known" : 1,
            "for" : 2,
            "his" : 3,
            "miserly" : 1,
            "ways" : 1,
            "On" : 1,
            "Eve" : 1,
            "visited" : 1,
            "series" : 1,
            "of" : 3,
            "ghosts" : 1,
            "starting" : 1,
            "with" : 1,
            "business" : 1,
            "partner" : 1,
            "Jacob" : 1,
            "Marley" : 1,
            "The" : 1,
            "three" : 1,
            "spirits" : 1,
            "which" : 1,
            "follow" : 1,
            "the" : 3,
            "Ghosts" : 1,
            "Past" : 1,
            "Present" : 1,
            "and" : 3,
            "Yet" : 1,
            "to" : 3,
            "Come" : 1,
            "show" : 1,
            "how" : 1,
            "mean" : 1,
            "behaviour" : 1,
            "has" : 1,
            "affected" : 1,
            "those" : 1,
            "around" : 1,
            "him" : 3,
            "At" : 1,
            "end" : 1,
            "story" : 1,
            "he" : 1,
            "relieved" : 1,
            "discover" : 1,
            "that" : 1,
            "there" : 1,
            "still" : 1,
            "time" : 1,
            "change" : 1,
            "we" : 1,
            "see" : 1,
            "transformed" : 1,
            "into" : 1,
            "generous" : 1,
            "kind-hearted" : 1,
            "human" : 1,
            "being" : 1
        },
        "word_count" : 101
    }
}`;
        this.statData = JSON.parse(json);
        this.formatWordFreq(this.statData['statistics']);
    }

    public formatWordFreq(data: any) {
        this.wordFreq = [];
        for (let word in data.word_frequency) {
            this.wordFreq.push({
                word:word,
                count: data.word_frequency[word]
                    });
        }



    }

    public selectSection(event: any) {
        alert(event.node);
        //we would want to call ask for the stats
    }



}