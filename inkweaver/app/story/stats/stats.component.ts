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
    }


    public selectSection(event: any) {
        this.data.statSection = event.node;
        this.statsService.get_section_statistics(event.node.data.section_id);
    //we would want to call ask for the stats
    }



}