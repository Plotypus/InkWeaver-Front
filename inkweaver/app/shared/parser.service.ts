import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ID } from '../models/id.model';
import { Alias } from '../models/link/alias.model';
import { AliasTable } from '../models/link/alias-table.model';
import { LinkTable } from '../models/link/link-table.model';
import { PassiveLink } from '../models/link/passive-link.model';
import { PassiveLinkTable } from '../models/link/passive-link-table.model';
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

    public findSection(story: TreeNode, sectionID: string, callback: Function = () => { }): TreeNode {
        if (sectionID === JSON.stringify(story.data.section_id)) {
            callback(story);
            return story;
        } else {
            for (let child of story.children) {
                let section: TreeNode = this.findSection(child, sectionID, callback);
                if (section) {
                    return section;
                }
            }
        }
        return null;
    }

    // Content
    public setContentDisplay(paragraphs: Paragraph[]): string {
        let content: string = '';
        for (let paragraph of paragraphs) {
            content += this.setParagraph(paragraph);
        }
        return content;
    }

    public setParagraph(paragraph: Paragraph): string {
        let content: string = '';
        if (paragraph.paragraph_id) {
            content += '<p id="' + paragraph.paragraph_id.$oid + '">';
            if (paragraph.note) {
                content += '<code>' + paragraph.note + '</code>';
            }
            content += paragraph.text + '</p>';
        }
        return content;
    }

    public parseContent(paragraphs: Paragraph[], aliasTable: AliasTable, linkTable: LinkTable, passiveLinkTable: PassiveLinkTable): ContentObject {
        let contentObject: ContentObject = new ContentObject();

        for (let paragraph of paragraphs) {
            this.parseParagraph(paragraph, aliasTable, linkTable, passiveLinkTable);
            contentObject[JSON.stringify(paragraph.paragraph_id)] = paragraph;
        }
        return contentObject;
    }

    public parseParagraph(paragraph: Paragraph, aliasTable: AliasTable, linkTable: LinkTable, passiveLinkTable: PassiveLinkTable) {
        paragraph.links = new AliasTable();
        paragraph.passiveLinks = new AliasTable();

        let text: string = paragraph.text;
        let r1: RegExp = /\s+/g;
        let r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
        let linkMatch: RegExpMatchArray = r2.exec(text);
        while (linkMatch) {
            let linkID: string = linkMatch[0].replace(r1, '');
            let aliasID: ID = linkTable[linkID];
            if (aliasID) {
                let alias: Alias = aliasTable[JSON.stringify(aliasID)];
                if (alias) {
                    let linkIDStr: string = JSON.parse(linkID).$oid;
                    let pageIDStr: string = alias.page_id.$oid;
                    paragraph.links[linkID] = alias;
                    paragraph.text = paragraph.text.replace(linkMatch[0],
                        '<a href="' + linkIDStr + '-' + pageIDStr + '" target="_blank">' + alias.alias_name + '</a>');
                }
            } else {
                let passiveLink: PassiveLink = passiveLinkTable[linkID];
                if (passiveLink) {
                    let pending: boolean = passiveLink.pending;
                    let alias: Alias = aliasTable[JSON.stringify(passiveLink.alias_id)];
                    if (alias) {
                        let linkIDStr: string = JSON.parse(linkID).$oid;
                        let pageIDStr: string = alias.page_id.$oid;
                        paragraph.passiveLinks[linkID] = alias;
                        paragraph.text = paragraph.text.replace(linkMatch[0],
                            '<a href="' + linkIDStr + '-' + pageIDStr + '-' + pending + '" target="_blank" id="' + pending + '">' + alias.alias_name + '</a>');
                    }
                }
            }
            linkMatch = r2.exec(text);
        }
    }

    public parseHtml(paragraphs: any): ContentObject {
        let addCount: number = 0;
        let add: Paragraph[] = [];
        let obj: ContentObject = new ContentObject();

        for (let paragraph of paragraphs) {
            let newText: string = paragraph.innerHTML.replace(new RegExp("<code>.*?</code>"), '');
            let p: Paragraph = {
                paragraph_id: new ID(),
                succeeding_paragraph_id: null,
                text: newText,
                links: new AliasTable(),
                passiveLinks: new AliasTable(),
                note: null
            };

            let id: string = paragraph.id;
            if (id !== 'added') {
                let oid: ID = { $oid: id };
                if (id && id !== 'new' && !obj[JSON.stringify(oid)]) {
                    for (let addP of add) {
                        addP.succeeding_paragraph_id = oid;
                        obj['new' + addCount++] = addP;
                    }
                    add = [];
                    p.paragraph_id = oid;
                    obj[JSON.stringify(oid)] = p;
                } else {
                    paragraph.id = 'added';
                    add.push(p);
                }

                let code: any = paragraph.querySelector('code');
                if (code) {
                    p.note = code.innerHTML;
                }

                let links: any[] = paragraph.querySelectorAll('a[href]');
                for (let link of links) {
                    let ids: string[] = link.attributes[0].value.split('-');
                    let linkID: ID = { $oid: ids[0] };
                    let pageID: ID = { $oid: ids[1] };

                    if (ids.length > 2) {
                        p.passiveLinks[JSON.stringify(linkID)] = { page_id: pageID, alias_name: link.innerHTML };
                    } else {
                        if (ids[0].startsWith('new')) {
                            p.links[ids[0]] = { page_id: pageID, alias_name: link.innerHTML };
                        } else {
                            p.links[JSON.stringify(linkID)] = { page_id: pageID, alias_name: link.innerHTML };
                        }
                    }
                }
            }
        }

        add.forEach((p: Paragraph) => {
            obj['new' + addCount++] = p;
        });
        return obj;
    }

    // Links
    public parseLinkTable(aliasList: any): any {
        let linkTable: LinkTable = new LinkTable();
        let aliasTable: AliasTable = new AliasTable();
        let passiveLinkTable: PassiveLinkTable = new PassiveLinkTable();

        for (let alias of aliasList) {
            aliasTable[JSON.stringify(alias.alias_id)] = alias;
            if (alias.link_ids) {
                for (let link of alias.link_ids) {
                    linkTable[JSON.stringify(link)] = alias.alias_id;
                }
            }
            if (alias.passive_links) {
                for (let link of alias.passive_links) {
                    passiveLinkTable[JSON.stringify(link.passive_link_id)] = {
                        alias_id: alias.alias_id, pending: link.pending
                    };
                }
            }
        }
        return [linkTable, aliasTable, passiveLinkTable];
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
        temp.type = "title";
        temp.children = [];
        temp.expanded = true;
        nav.push(temp);
        let pageDic = Array<TreeNode>();
        for (let index in json['segments']) {
            let result = this.jsonToWiki(json['segments'][index], pageDic);
            let tree: TreeNode;
            tree = result[0];
            tree.parent = temp;
            temp.children.push(result[0]);
            pageDic.concat(result[1]);
        }
        for (let index in json['pages']) {
            let result = this.jsonToPage(json['pages'][index]);
            temp.children.push(result);
            result.parent = temp;
            pageDic.push(result.data);
        }

        if (temp.children.length == 0) {
            temp.children.push({ label: 'Empty Section', type: "filler" });
        }

        return [nav, pageDic];
    }

    public jsonToWiki(wikiJson: any, pages: Array<TreeNode>) {
        let wiki: TreeNode = {};

        let parent: TreeNode = {};
        wiki.data = new PageSummary();
        wiki.children = new Array<TreeNode>();
        wiki.data.id = wikiJson["segment_id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];
        wiki.icon = "fa-book";

        for (let field in wikiJson) {
            if (field === "segments") {
                let segmentJsons = wikiJson[field];
                for (let segment in segmentJsons) {

                    let result = this.jsonToWiki(segmentJsons[segment], pages);
                    let subsegment: TreeNode;
                    subsegment = result[0];
                    pages.concat(result[1]);
                    subsegment.type = "category";
                    subsegment.parent = wiki;
                    /*
                    if(subsegment.children.length == 0)
                    {
                        subsegment.children.push({label:'Empty Section', type: "filler"});
                    }*/
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
            // wiki.children = wiki.children.sort(this.sort);
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
        page.icon = "fa-file-text-o"


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

    public setPageDisplay(reply: any, linktable: LinkTable, aliasTable: AliasTable) {
        // getting the alias
        if (reply.aliases) {
            let temp = [];
            let count = 0;
            for (let i in reply.aliases) {
                if (reply.title !== i) {
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
            }
            reply.aliases = temp;

        }
        return this.parseReferences(reply, linktable, aliasTable);


    }

    public parseReferences(reply: any, linktable: LinkTable, aliasTable: AliasTable) {
        if (reply.references)
            for (let ref of reply.references) {
                let id: string = JSON.stringify(ref.link_id);
                let text: string = ref.text;
                let r1: RegExp = /\s+/g;
                let r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
                let linkMatch: RegExpMatchArray = r2.exec(text);
                while (linkMatch) {
                    let linkID: string = linkMatch[0].replace(r1, '');
                    let aliasID: ID = linktable[linkID];
                    if (aliasID) {
                        let alias: Alias = aliasTable[JSON.stringify(aliasID)];
                        if (alias) {
                            if (id === linkID) {
                                ref.text = ref.text.replace(linkMatch[0],
                                    '<h1>' + alias.alias_name + '</h1>');
                            } else {
                                ref.text = ref.text.replace(linkMatch[0],
                                    '<h2>' + alias.alias_name + '</h2>');
                            }
                        }
                    }
                    linkMatch = r2.exec(text);
                }
            }
        return reply;
    }

    public findSegment(wiki: TreeNode, sid: any, mode: boolean = true) {
        let found: any;
        if ((mode ? JSON.stringify(sid["$oid"]) : JSON.stringify(sid)) ===
            (mode ? JSON.stringify(wiki.data.id["$oid"]) : JSON.stringify(wiki.data.id))) {
            return wiki;
        }
        for (let child of wiki.children) {
            if ((mode ? JSON.stringify(sid["$oid"]) : JSON.stringify(sid)) ===
                (mode ? JSON.stringify(child.data.id["$oid"]) : JSON.stringify(child.data.id))) {
                found = child;
                break;
            }
            else if (child.hasOwnProperty("children") && child.children.length != 0) {
                found = this.findSegment(child, sid, mode);
                if (found)
                    break;
            }
        }
        if (found)
            return found;
    }

    public findPage(wiki: TreeNode, pid: any, mode: boolean = true) {
        let found: any;
        if ((mode ? JSON.stringify(pid["$oid"]) : JSON.stringify(pid)) ===
            (mode ? JSON.stringify(wiki.data.id["$oid"]) : JSON.stringify(wiki.data.id))) {
            return wiki;
        }
        for (let child of wiki.children) {
            if ((mode ? JSON.stringify(pid["$oid"]) : JSON.stringify(pid)) ===
                (mode ? JSON.stringify(child.data.id["$oid"]) : JSON.stringify(child.data.id))) {
                found = child;
                break;
            }
            else if (child.hasOwnProperty("children") && child.children.length != 0) {
                found = this.findPage(child, pid, mode);
                if (found)
                    break;
            }
        }

        if (found)
            return found;
    }

    public deleteSegment(wiki: TreeNode, segment_id: string) {
        let index: number = wiki.children.findIndex((child: TreeNode) => {
            return JSON.stringify(segment_id) === JSON.stringify(child.data.id);
        });
        if (index !== -1) {
            wiki.children.splice(index, 1);

        } else {
            for (let child of wiki.children) {
                if (child.type == 'category')
                    this.deleteSegment(child, segment_id);
            }
        }
    }


    public deletePage(wiki: TreeNode, page_id: string) {
        let index: number = wiki.children.findIndex((child: TreeNode) => {
            return JSON.stringify(page_id) === JSON.stringify(child.data.id);

        });
        if (index !== -1) {
            wiki.children.splice(index, 1);

        } else {
            for (let child of wiki.children) {
                if (child.type == 'category')
                    this.deletePage(child, page_id);
            }
        }
    }

    public addSegment(wiki: TreeNode, reply: any) {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            let idx = this.LastCategory(wiki);
            //when adding a new segment
            let child = {
                parent: wiki, data: { title: reply.title, id: reply.segment_id }, type: 'category', label: reply.title, icon: "fa-book",
                children: []
            };
            wiki.children.splice(idx, 0, child)
        }

        else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                console.log(child);
                this.addSegment(child, reply);
            }
        }
    }

    public addPage(wiki: TreeNode, reply: any) {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            if (wiki.children[0].type == 'filler') {
                wiki.children = [];
            }
            wiki.children.push({
                parent: wiki, data: { title: reply.title, id: reply.page_id }, type: 'page', label: reply.title, icon: "fa-file-text-o",
            });
        } else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                this.addPage(child, reply);

            }
        }
    }


    public LastCategory(wiki: TreeNode) {
        let index = this.firstPage(wiki);
        return index;
    }
    public firstPage(wiki: TreeNode) {
        let index: number = wiki.children.findIndex((child: TreeNode) => {
            return child.type === 'page';
        });
        if (index == -1)
            index = wiki.children.length;
        return index;
    }


    public expandPath(page: TreeNode) {
        if (!(page.hasOwnProperty("type") && page.type === 'title')) {

            let parent = page.parent;
            while (typeof parent !== 'undefined') {
                if (parent.type === 'category')
                    parent.expanded = true;
                parent = parent.parent;
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

        for (let ele of arr) {

            dict[JSON.stringify(ele.data.section_id)] = ele.data;

        }

        return dict;
    }

    public getTreeArray(tree: TreeNode, mode: boolean = false) {
        let arr = [];
        if (!mode)
            arr.push(tree);
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
