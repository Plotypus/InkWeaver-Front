import { Component } from '@angular/core';

import { MenuItem } from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { ParserService } from '../shared/parser.service';
import { Pages } from '../models/pages.model';
import { Wiki } from '../models/wiki.model';

@Component({
    selector: 'wiki',
    templateUrl: './app/wiki/wiki.component.html'
})
export class WikiComponent {
    private wiki_pages: any;
    private chapters: MenuItem[];
    private tabs: any;
    private page: string;
    private data: any;
    private wiki_nav: any;
    private structure: Wiki;



    constructor(private wikiService: WikiService, private parser: ParserService) {

       
        this.data = this.parser.data;
        this.wiki_nav = this.data.wiki.hierarchy;
        console.log(this.wiki_nav.title);


        this.createNav();
        console.log(this.structure);
        /*this.wiki_pages = {
            'Luke Walker': ' &lt;em&gt;hello&lt;em&gt; Luke Skywalker and <em>Ben Kenobi<em> decided to go to the local spaceport, Mos Eisley, to find a pilot. The trip was uneventful. As they arrived, Ben exclaimed "Never before have I seen a more wretched hive of scum and villainy."',
            'Ben Kenobi': 'Back at home, Luke asked Ben what he should do about the cute girl he had met in school the previous day, but Ben seemed to not want to talk about it.',
            'Planet A': 'This is Planet A',
            'Planet B': ''
        };

        this.page = this.wiki_pages['Luke Walker'];
        this.tabs = [{
            id: 1,
            header: 'Characters',
            items: [{
                label: "Luke Walker", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            },
            {
                label: "Ben Kenobi", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            }
            ]
        }, {
            id: 2,
            header: 'Places',
            items: [{
                label: "Planet A", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            },
            {
                label: "Planet B", command: (event: any) => {
                    let chapter: string = event.item.label;
                    this.page = this.wiki_pages[chapter];
                }
            }
            ]
        }];*/
    }

    public createNav() {
        this.structure = this.jsonToWiki(this.wiki_nav);



    }

    public jsonToWiki(wikiJson: any) {
        var wiki = new Wiki();
        for (let field in wikiJson) {
            if (field === "id")
                wiki.id = wikiJson[field];
            else if (field === "title")
                wiki.title = wikiJson[field];
            else if (field === "segments") {
                var segmentJsons = wikiJson[field];
                var wikiSegments = new Array<Wiki>();
                for (let segment in segmentJsons) {
                    var subsegment = this.jsonToWiki(segmentJsons[segment]);
                    wikiSegments.push(subsegment);
                }
                wiki.segments = wikiSegments;
            }
            else if (field == "pages") {
                var pagesJsons = wikiJson[field];
                var wikiPages = new Array<Pages>();
                for (let page in pagesJsons) {
                    var leafpage = this.jsonToPage(pagesJsons[page]);
                    wikiPages.push(leafpage);
                }
                wiki.pages = wikiPages;
            }
        }
        return wiki
    }

    public jsonToPage(pageJson: any)
    {
        var page = new Pages();
        page.id = pageJson['id'];
        page.label = pageJson['title'];
        return page;
    }
/*
    public traverse(wiki: any) {
        for (let i in wiki) {
            console.log(i, wiki[i])
            if (wiki[i].length > 0 && i == "segments") {
                console.log(i, wiki[i]);
                this.traverse(wiki[i]);
            }
            if (wiki[i].length > 0 && i == "pages")
            {
                console.log(i, wiki[i]);
                this.traverse(wiki[i]);
            }
        }
    }
    */
    public setStoryDisplay() {
        this.data.display =
            '<h1>Title</h1><h2>' + this.data.story.title + '</h2><br>' +
            '<h1>Owner</h1><h2>' + this.data.story.owner + '</h2><br>' +
            '<h1>Synopsis</h1><h2>' + this.data.story.synopsis + '</h2><br>' +
            '<h1>Chapters</h1>';
        for (let chapter of this.data.story.chapters) {
            this.data.display += '<h2>' + chapter.title + '</h2>';
        }
        this.data.display += '<br>';
    }
}
