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

    //set up the class variables
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
    private rows = [];

    private domain1 = [];
    private domain2 = [];
    private domain1Sel: any;
    private domain2Sel:any;

    constructor(
        private router: Router,
        private editService: EditService,
        private wikiService: WikiService,
        private apiService: ApiService,
        private statsService: StatsService,
        private parserService: ParserService
    ) { }

    ngOnInit() {

        //get data
        this.data = this.apiService.data;

        //figures out where stats overlay is being called from
        //editor stats
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


    //gets the editor stats
    public getSectionStats() {
        if (this.data.section.data) {
            this.statsService.get_section_statistics(this.data.section.data.section_id);
        }
    }

    //shows the notebook stats
    public showWikiStats() {


        //getting the selected node
        let node = this.data.selectedEntry;
        let label = [];
        this.domain1 = [];
        this.domain2 = [];
        //figuring out our x axis values
        //this.values = [0,Object.keys(this.data.statsSections).length];
        let idx = 0;
        for (let l in this.data.statsSections){
            label.push(this.data.statsSections[l].title);
            this.domain1.push({label: this.data.statsSections[l].title, value: idx});
            this.domain2.push({label: this.data.statsSections[l].title, value: idx});
            idx++;
        }
        this.domain1Sel = this.domain1[0].value;
        this.domain2Sel = this.domain2[label.length-1].value;
        this.domain1.splice(label.length-1,1);
        this.domain2.splice(0,1);
            
        
        this.pageFreq = {};
        let dataset = [];
        this.statSegments = this.parserService.getTreeArray(node).filter((ele: any) => {
            return ele.type != 'category' && ele.type != 'title';
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

        // building our y axis 
        for (let ele of this.statSegments) {

            if (ele.type == 'page') {
                let color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                if ('_$visited' in ele.data.id)
                    delete ele.data.id['_$visited'];
                let data = this.data.statsPageFrequency[JSON.stringify(ele.data.id)].slice(0);
                dataset.push({
                    label: ele.data.title,
                    data: data.splice(this.domain1Sel,this.domain2Sel),
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

    //takes care of the changes to drop box to choose different characters to be shown
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

    //adds characters back to dropdown
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

    public updateDomain(type:any){
        //let domain = this.union(this.domain1,this.domain2);
        this.domain1 = this.union(this.domain1,this.domain2);
        this.domain1.splice(this.domain2Sel,1);
        this.domain2 = this.union(this.domain1,this.domain2);
        this.domain2.splice(0,this.domain1Sel+1);
        //this.domain2.splice(this.domain1Sel,1);
        

        this.updateChart();
    }

    public union(x:Array<any>,y:Array<any>){
        
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i].value] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i].value] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}
    

    //updates the graph
    public updateChart() {
        let label = [];
        for (let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);
            label = label.splice(this.domain1Sel,(this.domain2Sel-this.domain1Sel)+1);

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
                let data = this.data.statsPageFrequency[JSON.stringify(ele.data.id)].slice(0);

                dataset.push({
                    label: ele.data.title,
                    data: data.splice(this.domain1Sel,(this.domain2Sel-this.domain1Sel)+1),
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