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

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService
    ) { }

    ngOnInit(){
        this.data = this.apiService.data;
    }

    public selectSelection(event: any) {
        alert(event.node);
    }

}