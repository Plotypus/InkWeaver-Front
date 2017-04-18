import { Component, ViewChild, Input } from '@angular/core';
import { UIChart, TreeNode, SelectItem } from 'primeng/primeng';
import { Router } from '@angular/router';

import { EditService } from '../edit/edit.service';
import { WikiService } from '../wiki/wiki.service';
import { ApiService } from '../../shared/api.service';
import { StatsService } from './stats.service';
import { PageSummary } from '../../models/wiki/page-summary.model';
import { ParserService } from '../../shared/parser.service';

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
    private pageFreq: any;
    private wikiNav = [];
    private statsOptions: SelectItem[];
    private selectedOption: string;
    private colors = [];
    private statSegments: any;
    private allOptions: SelectItem[];
    private title: any;
    private chartOption: any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private statsService: StatsService,
        private parserService: ParserService
    ) { }

    ngOnInit() {
        this.data = this.apiService.data;
        if (this.mode) {
            this.getSectionStats();
        }
        //wiki stats
        else {
            this.showWikiStats();
            this.selectedOption = null;
            this.chartOption = {
                scales: {
                    yAxes: [{
                        ticks: {
                            stepSize: 1,
                            beginAtZero: true,
                            min: 0,
                            padding: 0
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            stepSize: 1,
                            beginAtZero: true,
                            min: 0,
                            padding: 0,
                            callback: function (value) { return value.length > 25 ? value.substring(0, 25) + '...' : value; }
                        }
                    }]
                }
            }
        }
    }


    public getSectionStats() {
        if (this.data.section.data) {
            this.statsService.get_section_statistics(this.data.section.data.section_id);
        }
        //we would want to call ask for the stats
    }

    public showWikiStats() {


        //this.data.statSegment = event.node;
        let node = this.data.selectedEntry;
        let label = [];
        for (let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);
        this.pageFreq = {};
        let dataset = [];
        this.statSegments = this.parserService.getTreeArray(node).filter((ele: any) => {
            return ele.type != 'filler' && ele.type != 'category' && ele.type != 'title';
        });

        this.statsOptions = this.data.wikiFlatten.filter((ele: any) => {

            return this.statSegments.indexOf(ele.value) == -1 && ele.value.type == 'page';

        });

        if (this.statSegments.length >= 1) {
            this.title = this.statSegments[0].label;
        }

        this.allOptions = this.data.wikiFlatten.filter((ele: any) => {
            return this.statSegments.indexOf(ele.value) != -1
        });

        this.allOptions = this.allOptions.concat(this.statsOptions);

        for (let ele of this.statSegments) {

            if (ele.type == 'page') {
                let color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                if ('_$visited' in ele.data.id)
                    delete ele.data.id['_$visited'];
                dataset.push({
                    label: ele.data.title,
                    data: this.data.statsPageFrequency[JSON.stringify(ele.data.id)],
                    fill: true,
                    borderColor: color,
                    backgroundColor: color
                });

                this.colors.push(color);
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

    public onChange() {
        let option = this.selectedOption;
        if (typeof option !== 'undefined') {
            this.statSegments.push(option);


            this.statsOptions = this.statsOptions.filter((ele: any) => {
                return ele.value != option;
            });
            this.updateChart();
            this.selectedOption = null;
        }
        else
            this.showWikiStats();



    }

    public updateDropdown(event: any, items: any) {

        let temp = [];
        for (let ele of items) {
            if ('_$visited' in ele.data.id) {
                delete ele.data.id['_$visited'];
                delete ele['_$visited'];
            }
            temp.push(ele);

        }
        items = temp;

        //finding what was removed
        let addback = this.allOptions.filter((ele: any) => {
            return items.indexOf(ele.value) == -1;
        })

        this.statsOptions = addback;
        this.colors.pop();
        this.updateChart();

    }


    public updateChart() {
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
                    borderColor: color,
                    backgroundColor: color
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