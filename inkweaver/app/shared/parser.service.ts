import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ID } from '../models/id.model';
import { Link } from '../models/link/link.model';
import { LinkTable } from '../models/link/link-table.model';
import { Section } from '../models/story/section.model';
import { Paragraph } from '../models/story/paragraph.model';
import { ContentObject } from '../models/story/content-object.model';
import { Segment } from '../models/wiki/segment.model';
import { PageSummary } from '../models/wiki/page-summary.model';

@Injectable()
export class ParserService {
    // ----------------------------------------------- //
    // -------------------- Story -------------------- //
    // ----------------------------------------------- //
    public sectionToTree(parserService: ParserService, story: any, parent: TreeNode): TreeNode {
        let treeNode: TreeNode = {};
        treeNode.data = {
            title: story.title,
            section_id: story.section_id
        };
        treeNode.parent = parent;

        let sectionToTree: (story: any) => TreeNode = (story: any) => {
            return parserService.sectionToTree(parserService, story, treeNode);
        };
        treeNode.children = story.preceding_subsections.map(sectionToTree)
            .concat(story.inner_subsections.map(sectionToTree))
            .concat(story.succeeding_subsections.map(sectionToTree));

        treeNode.leaf = treeNode.children.length == 0;
        return treeNode;
    }

    public setSection(story: TreeNode, section_id: string): TreeNode {
        let newSection: TreeNode = null;
        if (JSON.stringify(story.data.section_id) == section_id) {
            newSection = story;
        } else {
            for (let child of story.children) {
                let findSection: TreeNode = this.setSection(child, section_id);
                newSection = findSection ? findSection : newSection;
            }
        }
        if (newSection) {
            story.expanded = true;
        }
        return newSection;
    }

    public setContentDisplay(paragraphs: Paragraph[]): string {
        let content: string = '';
        for (let paragraph of paragraphs) {
            if (paragraph.paragraph_id) {
                content += '<p id="' + paragraph.paragraph_id.$oid + '">' + paragraph.text + '</p>';
            }
        }
        return content;
    }

    public parseContent(paragraphs: Paragraph[], linkTable: LinkTable): ContentObject {
        let contentObject: ContentObject = new ContentObject();

        for (let paragraph of paragraphs) {
            paragraph.links = new LinkTable();

            let text: string = paragraph.text;
            let r1: RegExp = /\s+/g;
            let r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
            let linkMatch: RegExpMatchArray = r2.exec(text);
            while (linkMatch) {
                let linkId: string = linkMatch[0].replace(r1, '');
                let link: Link = linkTable[linkId];
                paragraph.links[linkId] = link;

                let linkIdStr: string = JSON.parse(linkId).$oid;
                let pageIdStr: string = link.page_id.$oid;
                paragraph.text = paragraph.text.replace(linkMatch[0],
                    '<a href="' + linkIdStr + '-' + pageIdStr + '" target="_blank">' + link.name + '</a>');
                linkMatch = r2.exec(text);
            }
            contentObject[JSON.stringify(paragraph.paragraph_id)] = paragraph;
        }
        return contentObject;
    }

    public parseHtml(paragraphs: any[]): ContentObject {
        let add: Paragraph[] = [];
        let obj: ContentObject = new ContentObject();

        for (let paragraph of paragraphs) {
            let p: Paragraph = {
                paragraph_id: new ID(),
                succeeding_id: new ID(),
                text: paragraph.innerHTML,
                links: new LinkTable()
            };

            let id: string = paragraph.id;
            let oid: ID = { $oid: id };
            if (id && !obj[JSON.stringify(oid)]) {
                for (let addP of add) {
                    addP.succeeding_id = oid;
                    obj['new' + Math.random()] = addP;
                }
                add = [];
                p.paragraph_id = oid;
                obj[JSON.stringify(oid)] = p;
            } else {
                add.push(p);
            }

            let links: any[] = paragraph.querySelectorAll('a');
            for (let link of links) {
                let ids: string[] = link.attributes[0].value.split('-');
                let linkID: ID = { $oid: ids[0] };
                let pageID: ID = { $oid: ids[1] };

                if (ids[0].startsWith('new')) {
                    p.links[ids[0]] = { page_id: pageID, name: link.innerHTML };
                } else {
                    p.links[JSON.stringify(linkID)] = { page_id: pageID, name: link.innerHTML };
                }
            }
        }

        add.forEach((p: Paragraph) => {
            obj['new' + Math.random()] = p;
        });
        return obj;
    }

    public parseLinkTable(linkArray: any): LinkTable {
        let linkTable: LinkTable = new LinkTable();
        for (let link of linkArray) {
            linkTable[JSON.stringify(link.link_id)] = { page_id: link.page_id, name: link.name }
        }
        return linkTable;
    }

    // ---------------------------------------------- //
    // -------------------- Wiki -------------------- //
    // ---------------------------------------------- //
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
            nav.push(this.jsonToWiki(json['segments'][index], null));
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
                    if (par != null)
                        parent.parent = par;

                    var subsegment = this.jsonToWiki(segmentJsons[segment], parent);
                    subsegment.type = "category";
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
        if (typeof wiki.children !== 'undefined' && (wiki.children.length == 0 || wiki.children.length != 0)) {
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
}