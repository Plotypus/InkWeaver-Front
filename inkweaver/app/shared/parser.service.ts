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
import { Word } from '../models/stats/word.model';

@Injectable()
export class ParserService {
    // ----------------------------------------------- //
    // -------------------- Story -------------------- //
    // ----------------------------------------------- //

    // Sections
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

        treeNode.leaf = treeNode.children.length === 0;
        return treeNode;
    }

    public setSection(story: TreeNode, sectionID: string): TreeNode {
        let newSection: TreeNode = null;
        if (JSON.stringify(story.data.section_id) === sectionID) {
            newSection = story;
        } else {
            for (let child of story.children) {
                let findSection: TreeNode = this.setSection(child, sectionID);
                newSection = findSection ? findSection : newSection;
            }
        }
        if (newSection) {
            story.expanded = true;
        }
        return newSection;
    }

    public addSection(story: TreeNode, reply: any) {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(story.data.section_id)) {
            story.children.push({
                parent: story, data: { title: reply.title, section_id: reply.section_id }, children: []
            });
        } else {
            for (let child of story.children) {
                this.addSection(child, reply);
            }
        }
    }

    public deleteSection(story: TreeNode, section_id: string) {
        let index: number = story.children.findIndex((child: TreeNode) => {
            return section_id === JSON.stringify(child.data.section_id);
        });
        if (index !== -1) {
            story.children.splice(index, 1);
        } else {
            for (let child of story.children) {
                this.deleteSection(child, section_id);
            }
        }
    }

    public updateSection(story: TreeNode, sectionID: string, newTitle: string) {
        if (sectionID === JSON.stringify(story.data.section_id)) {
            story.data.title = newTitle;
        } else {
            for (let child of story.children) {
                this.updateSection(child, sectionID, newTitle);
            }
        }
    }

    // Content
    public setContentDisplay(paragraphs: Paragraph[]): string {
        let content: string = '';
        for (let paragraph of paragraphs) {
            if (paragraph.paragraph_id) {
                content += '<p id="' + paragraph.paragraph_id.$oid + '">';
                if (paragraph.note) {
                    content += '<code>' + paragraph.note + '</code>';
                }
                content += paragraph.text + '</p>';
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
                let linkID: string = linkMatch[0].replace(r1, '');
                let link: Link = linkTable[linkID];
                if (link) {
                    paragraph.links[linkID] = link;
                    let linkIDStr: string = JSON.parse(linkID).$oid;
                    let pageIDStr: string = link.page_id.$oid;
                    paragraph.text = paragraph.text.replace(linkMatch[0],
                        '<a href="' + linkIDStr + '-' + pageIDStr + '" target="_blank">' + link.name + '</a>');
                }
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
                links: new LinkTable(),
                note: null
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

            let code: any = paragraph.querySelector('code');
            if (code) {
                p.note = code.innerHTML;
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

    // Links
    public parseLinkTable(linkArray: any): LinkTable {
        let linkTable: LinkTable = new LinkTable();
        for (let link of linkArray) {
            linkTable[JSON.stringify(link.link_id)] = { page_id: link.page_id, name: link.name };
        }
        return linkTable;
    }

    // ---------------------------------------------- //
    // -------------------- Wiki -------------------- //
    // ---------------------------------------------- //
    public parseWiki(json: any, selected: any): any {
        let nav = new Array<TreeNode>();
        let temp: TreeNode = {};
        temp.data = new PageSummary();
        temp.data.id = json['segment_id'];
        temp.data.title = json['title'];
        temp.label = json['title'];
        temp.type = "category";
        temp.children = [];
        temp.expanded = true;
        nav.push(temp);
        let pageDic = Array<TreeNode>();
        let path = this.createPath(selected);
        for (let index in json['segments']) {
            let result = this.jsonToWiki(json['segments'][index], path, pageDic);
            let tree: TreeNode;
            tree = result[0];
            tree.parent = temp;
            temp.children.push(result[0]);
            pageDic.concat(result[1]);
        }
        for (let index in json['pages']) {
            let result = this.jsonToPage(json['pages'][index]);
            temp.children.push(result);
            pageDic.push(result.data);
        }

        return [nav, pageDic];
    }

    public jsonToWiki(wikiJson: any, selected: Array<String>, pages: Array<TreeNode>) {
        let wiki: TreeNode = {};

        let parent: TreeNode = {};
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["segment_id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];
        if (selected.length !== 0 && (wiki.label === selected[0])) {
            wiki.expanded = true;
            selected.shift();
        }
        for (let field in wikiJson) {
            if (field === "segments") {
                let segmentJsons = wikiJson[field];
                for (let segment in segmentJsons) {

                    let result = this.jsonToWiki(segmentJsons[segment], selected, pages);
                    let subsegment: TreeNode;
                    subsegment = result[0];
                    pages.concat(result[1]);
                    subsegment.type = "category";
                    subsegment.parent = wiki;
                    wiki.children.push(subsegment);
                }
            }
            else if (field === "pages") {
                let pagesJsons = wikiJson[field];
                for (let page in pagesJsons) {

                    let leafpage = this.jsonToPage(pagesJsons[page]);
                    pages.push(leafpage);
                    leafpage.parent = wiki;
                    wiki.children.push(leafpage);
                }
            }
        }
        if (typeof wiki.children !== 'undefined' && (wiki.children.length === 0 || wiki.children.length !== 0)) {
            wiki.type = "category";
            wiki.children = wiki.children.sort(this.sort);
        }

        return [wiki, pages];
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

    /**
     * Set the display for the wiki
     */
    public setWikiDisplay(reply: any) {
        let html: string = "";

        html += "<h1>" + reply["wiki_title"] + "</h1>";
        for (let idx in reply['users']) {
            html += "<br>By " + reply['users'][idx].name;
        }

        html += "<br><h2>Summary</h2><br>" + reply["summary"];
        return html;
    }

    public setPageDisplay(reply: any, linktable: LinkTable) {
        // getting the alias
        if (reply.aliases) {
            let temp = [];
            let count = 0;
            for (let i in reply.aliases) {
                temp.push({
                    'index': count,
                    'state': true,
                    'name': i,
                    'icon': 'fa-pencil',
                    'prev': '',
                    'id': reply.aliases[i]
                });
                count++;
            }
            reply.aliases = temp;

        }
        return this.parseReferences(reply, linktable);


    }

    public parseReferences(reply: any, linktable: LinkTable) {
        if (reply.references)
            for (let ref of reply.references) {
                let id: string = JSON.stringify(ref.link_id);
                let text: string = ref.text;
                let r1: RegExp = /\s+/g;
                let r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
                let linkMatch: RegExpMatchArray = r2.exec(text);
                while (linkMatch) {
                    let linkID: string = linkMatch[0].replace(r1, '');
                    let link: Link = linktable[linkID];

                    if (id === linkID) {
                        ref.text = ref.text.replace(linkMatch[0],
                            '<h1>' + link.name + '</h1>');
                    }
                    else {
                        ref.text = ref.text.replace(linkMatch[0],
                            '<h2>' + link.name + '</h2>');
                    }
                    linkMatch = r2.exec(text);
                }
            }
        return reply;
    }

    public createPath(page: any) {
        if (page.hasOwnProperty("type") && page.type === 'title')
            return new Array<String>();
        page.expanded = true;
        if(!page.hasOwnProperty("type"))
        {
            page.type = "";
        }
        let path = new Array<String>();
        path.push(page.label);
        let parent = page.parent;
        while (typeof parent !== 'undefined') {
            path.push(parent.label);
            parent = parent.parent;
        }
        path.pop();
        return path.reverse();

    }

    public findSegment(wiki: TreeNode, reply: any) {
        let found: any;
        for (let child of wiki.children) {
                if(JSON.stringify(reply.segment_id) === JSON.stringify(child.data.id))
                {
                    found = child;
                    break;
                }
                else if(child.hasOwnProperty("children") && child.children.length != 0)
                {
                    found = this.findSegment(child, reply);
                    if (found)
                        break;
                }
            }
        if (found)
            return found;
    }

    public findPage(wiki: TreeNode, reply: any) {
        let found: any;
        for (let child of wiki.children) {
                if(JSON.stringify(reply.page_id) === JSON.stringify(child.data.id))
                {
                    found = child;
                    break;
                }
                else if(child.hasOwnProperty("children") && child.children.length != 0){
                    found = this.findPage(child, reply);
                    if (found)
                        break;
                }
            }

        if (found)
            return found;
    }

    public addSegment(wiki: TreeNode, reply:any)
    {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            wiki.children.push({
                parent: wiki, data: { title: reply.title, id: reply.segment_id },type: 'category', label:reply.title , children: []
            });
        } else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                console.log(child);
                this.addSegment(child, reply);
            }
        }
    }

    public addPage(wiki: TreeNode, reply:any)
    {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            wiki.children.push({
                parent: wiki, data: { title: reply.title, id: reply.segment_id },type: 'page', label:reply.title , children: []
            });
        } else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                this.addPage(child, reply);
            
            }
        }
    }

    public sort(o1: any, o2: any) {
        if (o1.type === 'category' && o2.type === 'category')
            return 0;
        else if (o1.type === 'category' && o2.type === 'title')
            return 1;
        else if (o1.type === 'title' && o2.type === 'category')
            return -1;
        else if (o1.type === 'category' && o2.type === 'page')
            return -1;
        else if (o1.type === 'page' && o2.type === 'category')
            return 1;
        else if (o1.type === 'page' && o2.type === 'title')
            return 1;
        else if (o1.type === 'title' && o2.type === 'page')
            return -1;
        else
            return 0;

    }

    /*Stats*/
    public parseWordFrequency(reply: any) {
        let wordFreq = Array<Word>();
        for (let words in reply) {
            wordFreq.push({
                word: words,
                count: reply[words]
            });
        }

        return wordFreq;
    }

    public flattenTree(tree: TreeNode) {

        let arr = this.getTreeArray(tree);
        let dict = {};
        let key = {};
        for (let idx in arr) {

            dict[JSON.stringify(arr[idx].section_id)] = arr[idx];

        }

        return dict;
    }

    public getTreeArray(tree: TreeNode, mode: boolean = false) {
        let arr = [];
        if (!mode)
            arr.push(tree.data);
        else {
            if (tree.type == 'page')
                arr.push(tree);
        }
        for (let i in tree.children)
            arr = arr.concat(this.getTreeArray(tree.children[i], mode));
        return arr;
    }

    public parsePageFrequency(stats: any, wikiPages: any, sections: any) {
        let result = {};
        let count = [];
        let secList: any;
        let temp: any;
        let val: Number;

        for (let idx in stats) {
            count = [];
            secList = stats[idx].section_frequencies;

            for (let section in sections) {
                val = secList[section.substr(0, 8) + " " + section.substr(8)];
                if (val == undefined)
                    val = 0;
                count.push(val);
            }
            result[JSON.stringify(stats[idx].page_id)] = count;
        }

        return result;
    }
}
