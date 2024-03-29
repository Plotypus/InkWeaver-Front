﻿import { Component, ViewChild, Input, OnInit } from "@angular/core";
import { UIChart, SelectItem } from "primeng/primeng";
import { Router } from "@angular/router";

import { EditService } from "../edit/edit.service";
import { WikiService } from "../wiki/wiki.service";
import { ApiService } from "../../shared/api.service";
import { StatsService } from "./stats.service";
import { ParserService } from "../../shared/parser.service";

@Component({
  selector: "stats",
  templateUrl: "./app/story/stats/stats.component.html",
  styleUrls: ["./app/story/stats/stats.component.css"],
})
export class StatsComponent implements OnInit {
  // set up the class variables
  @ViewChild(UIChart) chart: UIChart;
  @Input() mode: boolean;
  private data: any;
  private wordFreq: any;
  private pageFreq: any;
  private statsOptions: SelectItem[];
  private selectedOption: string;
  private colors = [];
  private statSegments: any;
  private allOptions: SelectItem[];
  private chartOption: any;

  private domain1 = [];
  private domain2 = [];
  private domain1Sel: any;
  private domain2Sel: any;

  private excludeWord = [];

  constructor(
    private router: Router,
    private editService: EditService,
    private wikiService: WikiService,
    private apiService: ApiService,
    private statsService: StatsService,
    private parserService: ParserService
  ) {}

  ngOnInit() {
    // get data
    this.data = this.apiService.data;

    // figures out where stats overlay is being called from
    // editor stats
    if (this.mode) {
      this.getSectionStats();
    } else {
      // wiki stats
      this.chartOption = {
        scales: {
          yAxes: [
            {
              ticks: {
                stepSize: 1,
                beginAtZero: true,
                min: 0,
                padding: 0,
              },
            },
          ],
          xAxes: [
            {
              ticks: {
                stepSize: 1,
                beginAtZero: true,
                min: 0,
                padding: 0,
                callback: function (value) {
                  return value.length > 25
                    ? value.substring(0, 25) + "..."
                    : value;
                },
              },
            },
          ],
        },
        title: {
          display: true,
          text: "Custom Chart Title",
          fullWidth: true,
          fontSize: 30,
          fontColor: "#252E3B",
        },
      };
      this.showWikiStats();
      this.selectedOption = null;
    }
  }

  // gets the editor stats
  public getSectionStats() {
    if (this.data.section.data) {
      this.statsService.get_section_statistics(
        this.data.section.data.section_id,
        (reply: any) => {
          this.wordFreq = this.data.stats.word_frequency.slice(0);
        }
      );
    }
  }

  public updateWordTable() {
    this.wordFreq = this.data.stats.word_frequency.slice(0);
    this.wordFreq = this.wordFreq.filter((ele: any) => {
      return this.excludeWord.indexOf(ele.word) === -1;
    });
  }
  // shows the notebook stats
  public showWikiStats() {
    // getting the selected node
    const node = this.data.selectedEntry;
    const label = [];
    this.domain1 = [];
    this.domain2 = [];
    // figuring out our x axis values
    // this.values = [0,Object.keys(this.data.statsSections).length];
    let idx = 0;
    for (const l in this.data.statsSections) {
      if (this.data.statsSections.hasOwnProperty(l)) {
        label.push(this.data.statsSections[l].title);
        this.domain1.push({
          label: this.data.statsSections[l].title,
          value: idx,
        });
        this.domain2.push({
          label: this.data.statsSections[l].title,
          value: idx,
        });
        idx++;
      }
    }
    this.domain1Sel = this.domain1[0].value;
    this.domain2Sel = this.domain2[label.length - 1].value;
    this.domain1.splice(label.length - 1, 1);
    this.domain2.splice(0, 1);

    this.pageFreq = {};
    const dataset = [];
    this.statSegments = this.parserService
      .getTreeArray(node)
      .filter((ele: any) => {
        return ele.type !== "category" && ele.type !== "title";
      });

    this.statsOptions = this.data.wikiFlatten.filter((ele: any) => {
      return (
        this.statSegments.indexOf(ele.value) === -1 && ele.value.type === "page"
      );
    });

    this.allOptions = this.data.wikiFlatten.filter((ele: any) => {
      return this.statSegments.indexOf(ele.value) !== -1;
    });

    this.allOptions = this.allOptions.concat(this.statsOptions);

    // building our y axis
    for (const ele of this.statSegments) {
      if (ele.type === "page") {
        const color =
          "#" +
          (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        if ("_$visited" in ele.data.id) {
          delete ele.data.id["_$visited"];
        }
        const data =
          this.data.statsPageFrequency[JSON.stringify(ele.data.id)].slice(0);
        dataset.push({
          label: ele.data.title,
          data: data.splice(this.domain1Sel, this.domain2Sel),
          fill: true,
          borderColor: color,
          backgroundColor: color,
        });

        this.colors.push(color);
      }
    }

    this.pageFreq = {
      labels: label,
      datasets: dataset,
    };
    this.chartOption["title"].text =
      "Page Frequency for " + this.data.selectedEntry.data.title;
    setTimeout(() => {
      this.chart.refresh();
    }, 50);
  }

  // takes care of the changes to drop box to choose different characters to be shown
  public onChange() {
    const option = this.selectedOption;
    if (typeof option !== "undefined") {
      this.statSegments.push(option);

      this.statsOptions = this.statsOptions.filter((ele: any) => {
        return ele.value !== option;
      });
      this.updateChart();
      this.selectedOption = null;
    } else {
      this.showWikiStats();
    }
  }

  // adds characters back to dropdown
  public updateDropdown(event: any, items: any) {
    const temp = [];
    for (const ele of items) {
      if ("_$visited" in ele.data.id) {
        delete ele.data.id["_$visited"];
        delete ele["_$visited"];
      }
      temp.push(ele);
    }
    items = temp;

    // finding what was removed
    const addback = this.allOptions.filter((ele: any) => {
      return items.indexOf(ele.value) === -1;
    });

    this.statsOptions = addback;
    this.colors.pop();
    this.updateChart();
  }

  public updateDomain(type: any) {
    // let domain = this.union(this.domain1,this.domain2);
    this.domain1 = this.union(this.domain1, this.domain2);
    this.domain1.splice(this.domain2Sel, 1);
    this.domain2 = this.union(this.domain1, this.domain2);
    this.domain2.splice(0, this.domain1Sel + 1);
    // this.domain2.splice(this.domain1Sel,1);

    this.updateChart();
  }

  public union(x: Array<any>, y: Array<any>) {
    const obj = {};
    for (let i = x.length - 1; i >= 0; --i) {
      obj[x[i].value] = x[i];
    }
    for (let i = y.length - 1; i >= 0; --i) {
      obj[y[i].value] = y[i];
    }
    const res = [];
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        // <-- optional
        res.push(obj[k]);
      }
    }
    return res;
  }

  // updates the graph
  public updateChart() {
    let label = [];
    for (const l in this.data.statsSections) {
      if (this.data.statsSections.hasOwnProperty(l)) {
        label.push(this.data.statsSections[l].title);
      }
    }
    label = label.splice(
      this.domain1Sel,
      this.domain2Sel - this.domain1Sel + 1
    );

    const dataset = [];
    let cidx = 0;
    for (const ele of this.statSegments) {
      if (ele.type === "page") {
        let color: any;
        if (cidx < this.colors.length) {
          color = this.colors[cidx];
        } else {
          color =
            "#" +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        }
        if ("_$visited" in ele.data.id) {
          delete ele.data.id["_$visited"];
        }
        const data =
          this.data.statsPageFrequency[JSON.stringify(ele.data.id)].slice(0);

        dataset.push({
          label: ele.data.title,
          data: data.splice(
            this.domain1Sel,
            this.domain2Sel - this.domain1Sel + 1
          ),
          fill: true,
          borderColor: color,
          backgroundColor: color,
        });
        if (cidx >= this.colors.length) {
          this.colors.push(color);
        }
        cidx++;
      }
    }

    this.pageFreq = {
      labels: label,
      datasets: dataset,
    };
    setTimeout(() => {
      this.chart.refresh();
    }, 50);
  }
}
