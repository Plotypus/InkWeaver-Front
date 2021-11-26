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
const id_model_1 = require('../models/id.model');
const alias_table_model_1 = require('../models/link/alias-table.model');
const link_table_model_1 = require('../models/link/link-table.model');
const passive_link_table_model_1 = require('../models/link/passive-link-table.model');
const content_object_model_1 = require('../models/story/content-object.model');
const page_summary_model_1 = require('../models/wiki/page-summary.model');
let ParserService = class ParserService {
    sectionToTree(parserService, story, parent) {
        let treeNode = {};
        treeNode.data = {
            title: story.title,
            section_id: story.section_id
        };
        treeNode.parent = parent;
        let sectionToTree = (story) => {
            return parserService.sectionToTree(parserService, story, treeNode);
        };
        treeNode.children = story.preceding_subsections.map(sectionToTree)
            .concat(story.inner_subsections.map(sectionToTree))
            .concat(story.succeeding_subsections.map(sectionToTree));
        treeNode.leaf = treeNode.children.length === 0;
        return treeNode;
    }
    setSection(story, sectionID) {
        let newSection = null;
        if (JSON.stringify(story.data.section_id) === sectionID) {
            newSection = story;
        }
        else {
            for (let child of story.children) {
                let findSection = this.setSection(child, sectionID);
                newSection = findSection ? findSection : newSection;
            }
        }
        if (newSection) {
            story.expanded = true;
        }
        return newSection;
    }
    findSection(story, sectionID, callback = () => { }) {
        if (sectionID === JSON.stringify(story.data.section_id)) {
            callback(story);
            return story;
        }
        else {
            for (let child of story.children) {
                let section = this.findSection(child, sectionID, callback);
                if (section) {
                    return section;
                }
            }
        }
        return null;
    }
    setContentDisplay(paragraphs) {
        let content = '';
        for (let paragraph of paragraphs) {
            content += this.setParagraph(paragraph);
        }
        return content;
    }
    setParagraph(paragraph) {
        let content = '';
        if (paragraph.paragraph_id) {
            content += '<p id="' + paragraph.paragraph_id.$oid + '">';
            if (paragraph.note) {
                content += '<code>' + paragraph.note + '</code>';
            }
            content += paragraph.text + '</p>';
        }
        return content;
    }
    parseContent(paragraphs, aliasTable, linkTable, passiveLinkTable) {
        let contentObject = new content_object_model_1.ContentObject();
        let prev = null;
        for (let paragraph of paragraphs) {
            this.parseParagraph(paragraph, aliasTable, linkTable, passiveLinkTable);
            contentObject[JSON.stringify(paragraph.paragraph_id)] = paragraph;
            if (contentObject[JSON.stringify(prev)]) {
                contentObject[JSON.stringify(prev)].succeeding_paragraph_id = paragraph.paragraph_id;
            }
            paragraph.preceding_paragraph_id = prev;
            prev = paragraph.paragraph_id;
        }
        return [contentObject, prev];
    }
    parseParagraph(paragraph, aliasTable, linkTable, passiveLinkTable) {
        paragraph.links = new alias_table_model_1.AliasTable();
        paragraph.passiveLinks = new alias_table_model_1.AliasTable();
        let text = paragraph.text;
        let r1 = /\s+/g;
        let r2 = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
        let linkMatch = r2.exec(text);
        while (linkMatch) {
            let linkID = linkMatch[0].replace(r1, '');
            let link = linkTable[linkID];
            if (link) {
                let aliasID = link.alias_id;
                let alias = aliasTable[JSON.stringify(aliasID)];
                if (alias) {
                    let linkIDStr = JSON.parse(linkID).$oid;
                    let pageIDStr = alias.page_id.$oid;
                    if (link.deleted) {
                        let randomID = Math.random();
                        linkID = 'new' + randomID;
                        linkIDStr = 'new' + randomID;
                    }
                    paragraph.links[linkID] = alias;
                    paragraph.text = paragraph.text.replace(linkMatch[0], '<a href="' + linkIDStr + '-' + pageIDStr + '" target="_blank">' + alias.alias_name + '</a>');
                }
            }
            else {
                let passiveLink = passiveLinkTable[linkID];
                if (passiveLink) {
                    let pending = passiveLink.pending;
                    let alias = aliasTable[JSON.stringify(passiveLink.alias_id)];
                    if (alias) {
                        if (passiveLink.deleted) {
                            paragraph.text = paragraph.text.replace(linkMatch[0], alias.alias_name);
                        }
                        else {
                            let linkIDStr = JSON.parse(linkID).$oid;
                            let pageIDStr = alias.page_id.$oid;
                            paragraph.passiveLinks[linkID] = alias;
                            paragraph.text = paragraph.text.replace(linkMatch[0], '<a href="' + linkIDStr + '-' + pageIDStr + '-' + pending + '" target="_blank" id="' + pending + '">' + alias.alias_name + '</a>');
                        }
                    }
                }
            }
            linkMatch = r2.exec(text);
        }
    }
    parseHtml(paragraphs) {
        let addCount = 0;
        let add = [];
        let obj = new content_object_model_1.ContentObject();
        for (let paragraph of paragraphs) {
            let newText = paragraph.innerHTML.replace(new RegExp("<code>.*?</code>"), '');
            let p = {
                paragraph_id: new id_model_1.ID(),
                preceding_paragraph_id: null,
                succeeding_paragraph_id: null,
                text: newText,
                links: new alias_table_model_1.AliasTable(),
                passiveLinks: new alias_table_model_1.AliasTable(),
                note: null
            };
            let id = paragraph.id;
            if (id !== 'added') {
                let oid = { $oid: id };
                if (id && id !== 'new' && !obj[JSON.stringify(oid)]) {
                    for (let addP of add) {
                        addP.succeeding_paragraph_id = oid;
                        obj['new' + addCount++] = addP;
                    }
                    add = [];
                    p.paragraph_id = oid;
                    obj[JSON.stringify(oid)] = p;
                }
                else {
                    paragraph.id = 'added';
                    add.push(p);
                }
                let code = paragraph.querySelector('code');
                if (code) {
                    p.note = code.innerHTML;
                }
                let links = paragraph.querySelectorAll('a[href]');
                for (let link of links) {
                    let ids = link.attributes[0].value.split('-');
                    let linkID = { $oid: ids[0] };
                    let pageID = { $oid: ids[1] };
                    if (ids.length > 2) {
                        p.passiveLinks[JSON.stringify(linkID)] = { page_id: pageID, alias_name: link.innerHTML };
                    }
                    else {
                        if (ids[0].startsWith('new')) {
                            p.links[ids[0]] = { page_id: pageID, alias_name: link.innerHTML };
                        }
                        else {
                            p.links[JSON.stringify(linkID)] = { page_id: pageID, alias_name: link.innerHTML };
                        }
                    }
                }
            }
        }
        add.forEach((p) => {
            obj['new' + addCount++] = p;
        });
        return obj;
    }
    parseLinkTable(aliasList) {
        let linkTable = new link_table_model_1.LinkTable();
        let aliasTable = new alias_table_model_1.AliasTable();
        let passiveLinkTable = new passive_link_table_model_1.PassiveLinkTable();
        for (let alias of aliasList) {
            aliasTable[JSON.stringify(alias.alias_id)] = alias;
            if (alias.link_ids) {
                for (let link of alias.link_ids) {
                    linkTable[JSON.stringify(link)] = {
                        deleted: false, alias_id: alias.alias_id
                    };
                }
            }
            if (alias.passive_links) {
                for (let link of alias.passive_links) {
                    passiveLinkTable[JSON.stringify(link.passive_link_id)] = {
                        alias_id: alias.alias_id, pending: link.pending, deleted: false
                    };
                }
            }
        }
        return [linkTable, aliasTable, passiveLinkTable];
    }
    parseWiki(json, selected) {
        let nav = new Array();
        let temp = {};
        temp.data = new page_summary_model_1.PageSummary();
        temp.data.id = json['segment_id'];
        temp.data.title = json['title'];
        temp.label = json['title'];
        temp.type = "title";
        temp.children = [];
        temp.expanded = true;
        nav.push(temp);
        let pageDic = Array();
        for (let index in json['segments']) {
            let result = this.jsonToWiki(json['segments'][index], pageDic);
            let tree;
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
        return [nav, pageDic];
    }
    jsonToWiki(wikiJson, pages) {
        let wiki = {};
        let parent = {};
        wiki.data = new page_summary_model_1.PageSummary();
        wiki.children = new Array();
        wiki.data.id = wikiJson["segment_id"];
        wiki.data.title = wikiJson["title"];
        wiki.label = wikiJson["title"];
        wiki.icon = "fa-book";
        for (let field in wikiJson) {
            if (field === "segments") {
                let segmentJsons = wikiJson[field];
                for (let segment in segmentJsons) {
                    let result = this.jsonToWiki(segmentJsons[segment], pages);
                    let subsegment;
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
        }
        return [wiki, pages];
    }
    jsonToPage(pageJson) {
        let page = {};
        page.data = new page_summary_model_1.PageSummary();
        page.data.id = pageJson['page_id'];
        page.data.title = pageJson['title'];
        page.label = pageJson['title'];
        page.type = "page";
        page.icon = "fa-file-text-o";
        return page;
    }
    setWikiDisplay(reply) {
        let html = "";
        html += "<h1>" + reply["wiki_title"] + "</h1>";
        for (let idx in reply['users']) {
            html += "<br>By " + reply['users'][idx].name;
        }
        html += "<br><h2>Summary</h2><br>" + reply["summary"];
        return html;
    }
    setPageDisplay(reply, linktable, aliasTable, passiveLinkTable) {
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
                    'id': reply.aliases[i],
                    'main': false
                });
                if (reply.title == i) {
                    temp[count].main = true;
                }
                count++;
            }
            reply.aliases = temp;
        }
        return this.parseReferences(reply, linktable, aliasTable, passiveLinkTable);
    }
    parseReferences(reply, linktable, aliasTable, passiveLinkTable) {
        let refArray = [];
        if (reply.references)
            for (let ref of reply.references) {
                if (ref.text != null) {
                    let id = JSON.stringify(ref.link_id);
                    let text = ref.text;
                    let r1 = /\s+/g;
                    let r2 = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
                    let linkMatch = r2.exec(text);
                    while (linkMatch) {
                        let linkID = linkMatch[0].replace(r1, '');
                        let aliasID = new id_model_1.ID();
                        let link = linktable[linkID];
                        if (link) {
                            aliasID = link.alias_id;
                            if (aliasID) {
                                let alias = aliasTable[JSON.stringify(aliasID)];
                                if (alias) {
                                    if (id === linkID) {
                                        ref.text = ref.text.replace(linkMatch[0], '<h1>' + alias.alias_name + '</h1>');
                                    }
                                    else {
                                        ref.text = ref.text.replace(linkMatch[0], '<h2>' + alias.alias_name + '</h2>');
                                    }
                                }
                            }
                        }
                        else {
                            let pLink = passiveLinkTable[linkID];
                            if (pLink && pLink.alias_id)
                                aliasID = pLink.alias_id;
                            if (aliasID) {
                                let alias = aliasTable[JSON.stringify(aliasID)];
                                if (alias) {
                                    if (pLink.pending) {
                                        ref.text = ref.text.replace(linkMatch[0], '<h3>' + alias.alias_name + '</h3>');
                                    }
                                    else {
                                        ref.text = ref.text.replace(linkMatch[0], alias.alias_name);
                                    }
                                }
                            }
                        }
                        linkMatch = r2.exec(text);
                    }
                    refArray.push(ref);
                }
            }
        reply.references = refArray;
        return reply;
    }
    findSegment(wiki, sid, mode = true) {
        let found;
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
    findPage(wiki, pid, mode = true) {
        let found;
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
    deleteSegment(wiki, segment_id) {
        let index = wiki.children.findIndex((child) => {
            return JSON.stringify(segment_id) === JSON.stringify(child.data.id);
        });
        if (index !== -1) {
            wiki.children.splice(index, 1);
        }
        else {
            for (let child of wiki.children) {
                if (child.type == 'category')
                    this.deleteSegment(child, segment_id);
            }
        }
    }
    deletePage(wiki, page_id) {
        let index = wiki.children.findIndex((child) => {
            return JSON.stringify(page_id) === JSON.stringify(child.data.id);
        });
        if (index !== -1) {
            wiki.children.splice(index, 1);
        }
        else {
            for (let child of wiki.children) {
                if (child.type == 'category')
                    this.deletePage(child, page_id);
            }
        }
    }
    addSegment(wiki, reply) {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            let idx = this.LastCategory(wiki);
            let child = {
                parent: wiki, data: { title: reply.title, id: reply.segment_id }, type: 'category', label: reply.title, icon: "fa-book",
                children: []
            };
            wiki.children.splice(idx, 0, child);
        }
        else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                console.log(child);
                this.addSegment(child, reply);
            }
        }
    }
    addPage(wiki, reply) {
        if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
            wiki.children.push({
                parent: wiki, data: { title: reply.title, id: reply.page_id }, type: 'page', label: reply.title, icon: "fa-file-text-o",
            });
        }
        else if (wiki.hasOwnProperty("children") && wiki.children.length != 0) {
            for (let child of wiki.children) {
                this.addPage(child, reply);
            }
        }
    }
    LastCategory(wiki) {
        let index = this.firstPage(wiki);
        return index;
    }
    firstPage(wiki) {
        let index = wiki.children.findIndex((child) => {
            return child.type === 'page';
        });
        if (index == -1)
            index = wiki.children.length;
        return index;
    }
    expandPath(page) {
        if (!(page.hasOwnProperty("type") && page.type === 'title')) {
            let parent = page.parent;
            while (typeof parent !== 'undefined') {
                if (parent.type === 'category')
                    parent.expanded = true;
                parent = parent.parent;
            }
        }
    }
    sort(o1, o2) {
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
    parseWordFrequency(reply) {
        let wordFreq = Array();
        for (let words in reply) {
            wordFreq.push({
                word: words,
                count: reply[words]
            });
        }
        wordFreq.sort((a, b) => {
            let diff = b.count - a.count;
            if (diff === 0) {
                return a.word.localeCompare(b.word);
            }
            else
                return diff;
        });
        return wordFreq;
    }
    flattenTree(tree) {
        let arr = this.getTreeArray(tree);
        let dict = {};
        for (let ele of arr) {
            dict[JSON.stringify(ele.data.section_id)] = ele.data;
        }
        return dict;
    }
    getTreeArray(tree, mode = false) {
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
    parsePageFrequency(stats, wikiPages, sections) {
        let result = {};
        let count = [];
        let secList;
        let temp;
        let val;
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
    parseContentPDF(paragraphs, aliasTable, linkTable, passiveLinkTable) {
        let contentObject = new content_object_model_1.ContentObject();
        let prev = null;
        for (let paragraph of paragraphs) {
            this.parseParagraphPDF(paragraph, aliasTable, linkTable, passiveLinkTable);
        }
        return paragraphs;
    }
    parseParagraphPDF(paragraph, aliasTable, linkTable, passiveLinkTable) {
        paragraph.links = new alias_table_model_1.AliasTable();
        paragraph.passiveLinks = new alias_table_model_1.AliasTable();
        let text = paragraph.text;
        let r1 = /\s+/g;
        let r2 = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
        let linkMatch = r2.exec(text);
        while (linkMatch) {
            let linkID = linkMatch[0].replace(r1, '');
            let aliasID = new id_model_1.ID();
            let link = linkTable[linkID];
            if (link) {
                aliasID = link.alias_id;
                if (aliasID) {
                    let alias = aliasTable[JSON.stringify(aliasID)];
                    if (alias) {
                        let linkIDStr = JSON.parse(linkID).$oid;
                        let pageIDStr = alias.page_id.$oid;
                        paragraph.links[linkID] = alias;
                        paragraph.text = paragraph.text.replace(linkMatch[0], alias.alias_name);
                    }
                }
            }
            else {
                let passiveLink = passiveLinkTable[linkID];
                if (passiveLink) {
                    let pending = passiveLink.pending;
                    let alias = aliasTable[JSON.stringify(passiveLink.alias_id)];
                    if (alias) {
                        let linkIDStr = JSON.parse(linkID).$oid;
                        let pageIDStr = alias.page_id.$oid;
                        paragraph.passiveLinks[linkID] = alias;
                        paragraph.text = paragraph.text.replace(linkMatch[0], alias.alias_name);
                    }
                }
            }
            linkMatch = r2.exec(text);
        }
    }
    setContentDisplayPDF(paragraphs) {
        let content = '';
        for (let paragraph of paragraphs) {
            if (paragraph.paragraph_id)
                content += "<p>" + paragraph.text + "</p>";
        }
        return content;
    }
};
ParserService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [])
], ParserService);
exports.ParserService = ParserService;
//# sourceMappingURL=parser.service.js.map