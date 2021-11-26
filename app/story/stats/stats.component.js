"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const primeng_1 = require('primeng/primeng');
const router_1 = require('@angular/router');
const edit_service_1 = require('../edit/edit.service');
const wiki_service_1 = require('../wiki/wiki.service');
const api_service_1 = require('../../shared/api.service');
const stats_service_1 = require('./stats.service');
const parser_service_1 = require('../../shared/parser.service');
let StatsComponent = class StatsComponent {
    constructor(router, editService, wikiService, apiService, statsService, parserService) {
        this.router = router;
        this.editService = editService;
        this.wikiService = wikiService;
        this.apiService = apiService;
        this.statsService = statsService;
        this.parserService = parserService;
        this.wikiNav = [];
        this.colors = [];
        this.rows = [];
        this.domain1 = [];
        this.domain2 = [];
        this.excludeWord = [];
    }
    ngOnInit() {
        this.data = this.apiService.data;
        if (this.mode) {
            this.getSectionStats();
        }
        else {
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
                },
                title: {
                    display: true,
                    text: 'Custom Chart Title',
                    fullWidth: true,
                    fontSize: 30,
                    fontColor: "#252E3B"
                }
            };
            this.showWikiStats();
            this.selectedOption = null;
        }
    }
    getSectionStats() {
        if (this.data.section.data) {
            this.statsService.get_section_statistics(this.data.section.data.section_id, (reply) => {
                this.wordFreq = this.data.stats.word_frequency.slice(0);
            });
        }
    }
    updateWordTable() {
        this.wordFreq = this.data.stats.word_frequency.slice(0);
        this.wordFreq = this.wordFreq.filter((ele) => {
            return this.excludeWord.indexOf(ele.word) == -1;
        });
    }
    showWikiStats() {
        let node = this.data.selectedEntry;
        let label = [];
        this.domain1 = [];
        this.domain2 = [];
        let idx = 0;
        for (let l in this.data.statsSections) {
            label.push(this.data.statsSections[l].title);
            this.domain1.push({ label: this.data.statsSections[l].title, value: idx });
            this.domain2.push({ label: this.data.statsSections[l].title, value: idx });
            idx++;
        }
        this.domain1Sel = this.domain1[0].value;
        this.domain2Sel = this.domain2[label.length - 1].value;
        this.domain1.splice(label.length - 1, 1);
        this.domain2.splice(0, 1);
        this.pageFreq = {};
        let dataset = [];
        this.statSegments = this.parserService.getTreeArray(node).filter((ele) => {
            return ele.type != 'category' && ele.type != 'title';
        });
        this.statsOptions = this.data.wikiFlatten.filter((ele) => {
            return this.statSegments.indexOf(ele.value) == -1 && ele.value.type == 'page';
        });
        this.allOptions = this.data.wikiFlatten.filter((ele) => {
            return this.statSegments.indexOf(ele.value) != -1;
        });
        this.allOptions = this.allOptions.concat(this.statsOptions);
        for (let ele of this.statSegments) {
            if (ele.type == 'page') {
                let color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                if ('_$visited' in ele.data.id)
                    delete ele.data.id['_$visited'];
                let data = this.data.statsPageFrequency[JSON.stringify(ele.data.id)].slice(0);
                dataset.push({
                    label: ele.data.title,
                    data: data.splice(this.domain1Sel, this.domain2Sel),
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
        this.chartOption['title'].text = "Page Frequency for " + this.data.selectedEntry.data.title;
        setTimeout(() => {
            this.chart.refresh();
        }, 50);
    }
    onChange() {
        let option = this.selectedOption;
        if (typeof option !== 'undefined') {
            this.statSegments.push(option);
            this.statsOptions = this.statsOptions.filter((ele) => {
                return ele.value != option;
            });
            this.updateChart();
            this.selectedOption = null;
        }
        else
            this.showWikiStats();
    }
    updateDropdown(event, items) {
        let temp = [];
        for (let ele of items) {
            if ('_$visited' in ele.data.id) {
                delete ele.data.id['_$visited'];
                delete ele['_$visited'];
            }
            temp.push(ele);
        }
        items = temp;
        let addback = this.allOptions.filter((ele) => {
            return items.indexOf(ele.value) == -1;
        });
        this.statsOptions = addback;
        this.colors.pop();
        this.updateChart();
    }
    updateDomain(type) {
        this.domain1 = this.union(this.domain1, this.domain2);
        this.domain1.splice(this.domain2Sel, 1);
        this.domain2 = this.union(this.domain1, this.domain2);
        this.domain2.splice(0, this.domain1Sel + 1);
        this.updateChart();
    }
    union(x, y) {
        var obj = {};
        for (var i = x.length - 1; i >= 0; --i)
            obj[x[i].value] = x[i];
        for (var i = y.length - 1; i >= 0; --i)
            obj[y[i].value] = y[i];
        var res = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k))
                res.push(obj[k]);
        }
        return res;
    }
    updateChart() {
        let label = [];
        for (let l in this.data.statsSections)
            label.push(this.data.statsSections[l].title);
        label = label.splice(this.domain1Sel, (this.domain2Sel - this.domain1Sel) + 1);
        let dataset = [];
        let cidx = 0;
        for (let ele of this.statSegments) {
            if (ele.type == 'page') {
                let color;
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
                    data: data.splice(this.domain1Sel, (this.domain2Sel - this.domain1Sel) + 1),
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
};
__decorate([
    core_1.ViewChild(primeng_1.UIChart), 
    __metadata('design:type', primeng_1.UIChart)
], StatsComponent.prototype, "chart", void 0);
__decorate([
    core_1.Input(), 
    __metadata('design:type', Boolean)
], StatsComponent.prototype, "mode", void 0);
StatsComponent = __decorate([
    core_1.Component({
        selector: 'stats',
        templateUrl: './app/story/stats/stats.component.html'
    }), 
    __metadata('design:paramtypes', [router_1.Router, edit_service_1.EditService, wiki_service_1.WikiService, api_service_1.ApiService, stats_service_1.StatsService, parser_service_1.ParserService])
], StatsComponent);
exports.StatsComponent = StatsComponent;
//# sourceMappingURL=stats.component.js.map