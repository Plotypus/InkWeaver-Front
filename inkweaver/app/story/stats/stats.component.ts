import { Component, ViewChild } from '@angular/core';
import { UIChart,TreeNode } from 'primeng/primeng';
import { Router } from '@angular/router';

import { EditService } from '../edit/edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ApiService } from '../../shared/api.service';
import {StatsService} from './stats.service';
import { PageSummary } from '../../models/wiki/page-summary.model';
import {ParserService} from '../../shared/parser.service';

@Component({
    selector: 'stats',
    templateUrl: './app/story/stats/stats.component.html'
})
export class StatsComponent {
    @ViewChild(UIChart) chart: UIChart;
    private data: any;
    private wordFreq: any;
    private statData: any;
    private mode:any;
    private pageFreq:any;
    private wikiNav = [];
    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private statsService: StatsService,
        private parserService: ParserService
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
        this.statsService.get_page_frequency(this.data.story.story_id,this.data.wiki.wiki_id);
        this.mode = true;
    }


    public selectSection(event: any) {
        this.mode = true;
        this.data.statSection = event.node;
        this.statsService.get_section_statistics(event.node.data.section_id);
    //we would want to call ask for the stats
    }

    public selectSegment(event:any)
    {
        /*
        this.mode = false;
        this.data.statSegment = event.node;
        let label = [];
        for(let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);
        this.pageFreq = {};
       
        this.pageFreq = {
            labels: label,
            datasets:[{
                    label: event.node.data.title,
                    data: this.data.statsPageFrequency[JSON.stringify(event.node.data.id)],
                    fill: true,
                    borderColor: '#4bc0c0'
            }]
        };
        setTimeout( () => {
            this.chart.refresh();
        }, 50);
        */

     
    }



}