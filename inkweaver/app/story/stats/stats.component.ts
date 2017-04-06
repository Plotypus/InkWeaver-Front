import { Component, ViewChild, Input } from '@angular/core';
import { UIChart, TreeNode, SelectItem } from 'primeng/primeng';
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
    @Input() mode: boolean;
    private data: any;
    private wordFreq: any;
    private statData: any;
    private pageFreq:any;
    private wikiNav = [];
    private statsOptions: SelectItem[];
    private selectedOption: any;
    private colors = []; 
    private statSegments: any;
    private allOptions: SelectItem[];
    
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
        /*
        if(!this.data.statSection.hasOwnProperty('data'))
        {
            this.data.statSection = this.data.storyNode[0];
            this.statsService.get_section_statistics(this.data.storyNode[0].data.section_id);   
        }
        else
            this.statsService.get_section_statistics(this.data.statSection.data.section_id);
        this.statsService.get_page_frequency(this.data.story.story_id,this.data.wiki.wiki_id);
        */
        //mode true show editor stats
        if(this.mode)
        {

        }
        //wiki stats
        else{
            this.showWikiStats();
        }
    }


    public selectSection(event: any) {
        
        this.data.statSection = event.node;
        this.statsService.get_section_statistics(event.node.data.section_id);
    //we would want to call ask for the stats
    }

    public showWikiStats()
    {
        
        
        //this.data.statSegment = event.node;
        let node = this.data.selectedEntry;
        let label = [];
        for(let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);
        this.pageFreq = {};
        let dataset = [];
        this.statSegments = this.parserService.getTreeArray(node).filter((ele:any)=>
            {
            return ele.type != 'filler' && ele.type != 'category';
            });

        this.statsOptions = this.data.wikiFlatten.filter((ele: any) => {

            return this.statSegments.indexOf(ele.value) == -1 && ele.value.type == 'page';

        });

        this.allOptions = this.statsOptions;
        
        for(let ele of this.statSegments)
        {    
        
            if (ele.type == 'page') {
                let color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                if ('_$visited' in ele.data.id)
                    delete ele.data.id['_$visited'];
                dataset.push({
                    label: ele.data.title,
                    data: this.data.statsPageFrequency[JSON.stringify(ele.data.id)],
                    fill: true,
                    borderColor: color
                });

                this.colors.push(color);
            }
        }

        this.pageFreq = {
            labels: label,
            datasets: dataset
        };
        setTimeout( () => {
            this.chart.refresh();
        }, 50);
        
    }

    public onChange(event:any){
        this.statSegments.push(this.selectedOption);

        this.statsOptions = this.statsOptions.filter((ele:any)=>{
            return ele.value != this.selectedOption;
        });
        this.updateChart();

        
    }

    public updateDropdown(event:any, items:any){

        //finding what was removed
        let addback = this.allOptions.filter((ele:any) => {
            return items.indexOf(ele) == -1;
        })

        let toadd = addback.filter((ele:any)=>{
            return this.statsOptions.indexOf(ele) == -1;
        });

        this.statsOptions = addback;
        this.colors.pop();
        this.updateChart();

    }


    public updateChart()
    {
        let label = [];
        for (let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);

        let dataset = [];
        let cidx = 0;
        for (let ele of this.statSegments) {

            if (ele.type == 'page') {
                let color: any;
                if (cidx < this.colors.length) {
                    color = this.colors[cidx];

                }
                else {
                    color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                }
                if ('_$visited' in ele.data.id)
                    delete ele.data.id['_$visited'];

                dataset.push({
                    label: ele.data.title,
                    data: this.data.statsPageFrequency[JSON.stringify(ele.data.id)],
                    fill: true,
                    borderColor: color
                });
                if (cidx >= this.colors.length)
                    this.colors.push(color);
                cidx++;
            }
        }

        this.pageFreq = {
            labels: label,
            datasets: dataset
        };
        setTimeout(() => {
            this.chart.refresh();
        }, 50);
    }


}