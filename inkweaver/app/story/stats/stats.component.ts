import { Component } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { Router } from '@angular/router';

import { EditService } from '../edit/edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ApiService } from '../../shared/api.service';
import {StatsService} from './stats.service';
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
        private apiService: ApiService,
        private statsService: StatsService
    ) { }

    ngOnInit(){
        this.data = this.apiService.data;
        if(!this.data.statSection.hasOwnProperty('data'))
        {
            this.data.statSection = this.data.storyNode[0];
            this.statsService.get_section_statistics(this.data.storyNode[0].data.section_id);   
        }
        else
            this.statsService.get_section_statistics(this.data.statSection.data.section_id);
    }


    public selectSection(event: any) {
        this.data.statSection = event.node;
        this.statsService.get_section_statistics(event.node.data.section_id);
    //we would want to call ask for the stats
    }

    public selectSegment(event:any)
    {
        this.data.statSegment = event.node;
        this.statsService.get_page_frequency(this.data.story.story_id,this.data.wiki.wiki_id);
    }



}