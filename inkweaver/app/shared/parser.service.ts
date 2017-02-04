import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { Section } from '../models/section.model';
import { Segment } from '../models/segment.model';
import { Paragraph } from '../models/paragraph.model';
import { PageSummary } from '../models/page-summary.model';

@Injectable()
export class ParserService {
    public sectionToTree(parserService: ParserService, story: Section): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.data = {
            title: story.title,
            section_id: story.section_id
        };

        let sectionToTree: (story: Section) => TreeNode = (story: Section) => {
            return parserService.sectionToTree(parserService, story);
        };

        treeNode.children = story.preceding_subsections.map(sectionToTree)
            .concat(story.inner_subsections.map(sectionToTree))
            .concat(story.succeeding_subsections.map(sectionToTree));
        treeNode.leaf = treeNode.children.length == 0;

        return treeNode;
    }

    public parseWiki(json: any) {
        let nav = new Array<TreeNode>();
        let temp: TreeNode = {};
        temp.data = new PageSummary();
        temp.data.id = json['segment_id'];
        temp.data.title = json['title'];
        temp.label = json['title'];
        temp.type = "title"
        nav.push(temp);
        for (let index in json['segments']) {
            nav.push(this.jsonToWiki(json['segments'][index], {}));
        }
        for (let index in json['pages'])
            nav.push(this.jsonToPage(json['pages'][index]));

        return nav;
    }
    public jsonToWiki(wikiJson: any, par: any): TreeNode {
        let wiki: TreeNode = {};
        let parent: TreeNode = {};
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["segment_id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];
        for (let field in wikiJson) {
            if (field === "segments") {
                let segmentJsons = wikiJson[field];
                for (let segment in segmentJsons) {
                    parent.label = wiki.label;
                    parent.parent = par;

                    var subsegment = this.jsonToWiki(segmentJsons[segment], parent);
                    subsegment.parent = parent;
                    wiki.children.push(subsegment);
                }

            }
            else if (field == "pages") {
                var pagesJsons = wikiJson[field];
                for (let page in pagesJsons) {
                    parent.label = wiki.label;
                    parent.parent = par;


                    var leafpage = this.jsonToPage(pagesJsons[page]);
                    leafpage.parent = parent;
                    wiki.children.push(leafpage);
                }

            }
        }
        if (typeof wiki.children !== 'undefined' && wiki.children.length != 0) {

            wiki.type = "category";
        }
        return wiki
    }

    /**
     * Parses the Json for Pages
     * @param pageJson
     */
    public jsonToPage(pageJson: any): TreeNode {
        let page: TreeNode = {};
        page.data = new PageSummary();
        page.data.id = pageJson['page_id'];
        page.data.title = pageJson['title'];
        page.label = pageJson['title'];
        page.type = "page";

        return page;
    }

    public segmentToTree(parserService: ParserService, wiki: Segment): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.data = {
            title: wiki.title,
            segment_id: wiki.segment_id
        };

        let segmentToTree: (wiki: Segment) => TreeNode = (wiki: Segment) => {
            return parserService.segmentToTree(parserService, wiki);
        };

        treeNode.children = wiki.segments.map(segmentToTree)
            .concat(wiki.pages.map(parserService.pageToTree));
        treeNode.leaf = false;

        return treeNode;
    }

    public pageToTree(page: PageSummary): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.data = {
            title: page.title,
            page_id: page.page_id
        };
        treeNode.leaf = true;

        return treeNode;
    }

    /**
     * Set the display for the content
     */
    public setContentDisplay(paragraphs: Paragraph[]): string {
        let content: string = '';
        for (let i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].paragraph_id) {
                content += '<p><code>' + JSON.stringify(paragraphs[i].paragraph_id) + '</code>'
                    + paragraphs[i].text + '</p>';
            }
        }
        return content;
    }

    /**
     * Set the display for the wiki
     */
    public setWikiDisplay(reply: any) {
        let html: string = "";


        html += "<h1>" + reply["wiki_title"] + "</h1>";

        for (let idx in reply['users']) {
            html += "<br> By " + reply['users'][idx].name;
        }

        html += "<br> <h2> Summary </h2> <br> " + reply["summary"];

        return html;



    }
    public setPageDisplay(reply: any) {

        return 'Page';
    }

    public parseHtml(text: string): any {
        let add: any[] = [];
        let r1: RegExp = new RegExp('<p>(.*?)<\/p>', 'g');
        let matches: RegExpMatchArray = r1.exec(text);

        let obj: any = { add: [] };
        while (matches) {
            let match: string = matches[1];
            let p: any = { text: match, links: [] };

            let r2: RegExp = new RegExp('<a href="(.+?)".*?>(.+?)<\/a>', 'g');
            let link: RegExpMatchArray = r2.exec(match);
            while (link) {
                p.links.push({ id: link[1], text: link[2] });
                link = r2.exec(match);
            }

            let r3: RegExp = new RegExp('<code>(.+?)<\/code>');
            let id: RegExpMatchArray = match.match(r3);
            if (id) {
                for (let addP of add) {
                    addP.succeeding_id = id[1];
                    obj.add.push(addP);
                }
                add = [];
                obj[id[1]] = p;
            } else {
                add.push(p);
            }
            matches = r1.exec(text);
        }

        obj.add = obj.add.concat(add);
        return obj;
    }
}