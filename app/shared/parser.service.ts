import { Injectable } from "@angular/core";
import { TreeNode } from "primeng/primeng";

import { ID } from "../models/id.model";
import { Alias } from "../models/link/alias.model";
import { AliasTable } from "../models/link/alias-table.model";
import { LinkTable } from "../models/link/link-table.model";
import { Link } from "../models/link/link.model";
import { PassiveLink } from "../models/link/passive-link.model";
import { PassiveLinkTable } from "../models/link/passive-link-table.model";
import { Paragraph } from "../models/story/paragraph.model";
import { ContentObject } from "../models/story/content-object.model";
import { PageSummary } from "../models/wiki/page-summary.model";
import { Word } from "../models/stats/word.model";

@Injectable()
export class ParserService {
  // ----------------------------------------------- //
  // -------------------- Story -------------------- //
  // ----------------------------------------------- //

  // Sections
  public sectionToTree(
    parserService: ParserService,
    story: any,
    parent: TreeNode
  ): TreeNode {
    const treeNode: TreeNode = {};
    treeNode.data = {
      title: story.title,
      section_id: story.section_id,
    };
    treeNode.parent = parent;

    const sectionToTree: (otherStory: any) => TreeNode = (otherStory: any) => {
      return parserService.sectionToTree(parserService, otherStory, treeNode);
    };
    treeNode.children = story.preceding_subsections
      .map(sectionToTree)
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
      for (const child of story.children) {
        const findSection: TreeNode = this.setSection(child, sectionID);
        newSection = findSection ? findSection : newSection;
      }
    }
    if (newSection) {
      story.expanded = true;
    }
    return newSection;
  }

  public findSection(
    story: TreeNode,
    sectionID: string,
    callback: Function = () => {}
  ): TreeNode {
    if (sectionID === JSON.stringify(story.data.section_id)) {
      callback(story);
      return story;
    } else {
      for (const child of story.children) {
        const section: TreeNode = this.findSection(child, sectionID, callback);
        if (section) {
          return section;
        }
      }
    }
    return null;
  }

  // Content
  public setContentDisplay(paragraphs: Paragraph[]): string {
    let content = "";
    for (const paragraph of paragraphs) {
      content += this.setParagraph(paragraph);
    }
    return content;
  }

  public setParagraph(paragraph: Paragraph): string {
    let content = "";
    if (paragraph.paragraph_id) {
      content += '<p id="' + paragraph.paragraph_id.$oid + '">';
      if (paragraph.note) {
        content += "<code>" + paragraph.note + "</code>";
      }
      content += paragraph.text + "</p>";
    }
    return content;
  }

  public parseContent(
    paragraphs: Paragraph[],
    aliasTable: AliasTable,
    linkTable: LinkTable,
    passiveLinkTable: PassiveLinkTable
  ): [ContentObject, ID] {
    const contentObject: ContentObject = new ContentObject();

    let prev: ID = null;
    for (const paragraph of paragraphs) {
      // Parse the current paragraph
      this.parseParagraph(paragraph, aliasTable, linkTable, passiveLinkTable);
      contentObject[JSON.stringify(paragraph.paragraph_id)] = paragraph;
      if (contentObject[JSON.stringify(prev)]) {
        contentObject[JSON.stringify(prev)].succeeding_paragraph_id =
          paragraph.paragraph_id;
      }

      // Update the previous ID
      paragraph.preceding_paragraph_id = prev;
      prev = paragraph.paragraph_id;
    }
    return [contentObject, prev];
  }

  // Parse the links/notes of a paragraph
  public parseParagraph(
    paragraph: Paragraph,
    aliasTable: AliasTable,
    linkTable: LinkTable,
    passiveLinkTable: PassiveLinkTable
  ) {
    paragraph.links = new AliasTable();
    paragraph.passiveLinks = new AliasTable();

    const text: string = paragraph.text;
    const r1: RegExp = /\s+/g;
    const r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
    let linkMatch: RegExpMatchArray = r2.exec(text);
    while (linkMatch) {
      let linkID: string = linkMatch[0].replace(r1, "");
      const link: Link = linkTable[linkID];
      if (link) {
        const aliasID: ID = link.alias_id;
        const alias: Alias = aliasTable[JSON.stringify(aliasID)];
        if (alias) {
          let linkIDStr: string = JSON.parse(linkID).$oid;
          const pageIDStr: string = alias.page_id.$oid;
          if (link.deleted) {
            const randomID: number = Math.random();
            linkID = "new" + randomID;
            linkIDStr = "new" + randomID;
          }
          paragraph.links[linkID] = alias;
          paragraph.text = paragraph.text.replace(
            linkMatch[0],
            '<a href="' +
              linkIDStr +
              "-" +
              pageIDStr +
              '" target="_blank">' +
              alias.alias_name +
              "</a>"
          );
        }
      } else {
        const passiveLink: PassiveLink = passiveLinkTable[linkID];
        if (passiveLink) {
          const pending: boolean = passiveLink.pending;
          const alias: Alias = aliasTable[JSON.stringify(passiveLink.alias_id)];
          if (alias) {
            if (passiveLink.deleted) {
              paragraph.text = paragraph.text.replace(
                linkMatch[0],
                alias.alias_name
              );
            } else {
              const linkIDStr: string = JSON.parse(linkID).$oid;
              const pageIDStr: string = alias.page_id.$oid;
              paragraph.passiveLinks[linkID] = alias;
              paragraph.text = paragraph.text.replace(
                linkMatch[0],
                '<a href="' +
                  linkIDStr +
                  "-" +
                  pageIDStr +
                  "-" +
                  pending +
                  '" target="_blank" id="' +
                  pending +
                  '">' +
                  alias.alias_name +
                  "</a>"
              );
            }
          }
        }
      }
      linkMatch = r2.exec(text);
    }
  }

  // Parse the HTML of the editor into a paragraph content object
  public parseHtml(paragraphs: any): ContentObject {
    let addCount = 0;
    let add: Paragraph[] = [];
    const obj: ContentObject = new ContentObject();

    for (const paragraph of paragraphs) {
      const newText: string = paragraph.innerHTML.replace(
        new RegExp("<code>.*?</code>"),
        ""
      );
      const p: Paragraph = {
        paragraph_id: new ID(),
        preceding_paragraph_id: null,
        succeeding_paragraph_id: null,
        text: newText,
        links: new AliasTable(),
        passiveLinks: new AliasTable(),
        note: null,
      };

      const id: string = paragraph.id;
      if (id !== "added") {
        const oid: ID = { $oid: id };
        if (id && id !== "new" && !obj[JSON.stringify(oid)]) {
          for (const addP of add) {
            addP.succeeding_paragraph_id = oid;
            obj["new" + addCount++] = addP;
          }
          add = [];
          p.paragraph_id = oid;
          obj[JSON.stringify(oid)] = p;
        } else {
          paragraph.id = "added";
          add.push(p);
        }

        const code: any = paragraph.querySelector("code");
        if (code) {
          p.note = code.innerHTML;
        }

        const links: any[] = paragraph.querySelectorAll("a[href]");
        for (const link of links) {
          const ids: string[] = link.attributes[0].value.split("-");
          const linkID: ID = { $oid: ids[0] };
          const pageID: ID = { $oid: ids[1] };

          if (ids.length > 2) {
            p.passiveLinks[JSON.stringify(linkID)] = {
              page_id: pageID,
              alias_name: link.innerHTML,
            };
          } else {
            if (ids[0].startsWith("new")) {
              p.links[ids[0]] = { page_id: pageID, alias_name: link.innerHTML };
            } else {
              p.links[JSON.stringify(linkID)] = {
                page_id: pageID,
                alias_name: link.innerHTML,
              };
            }
          }
        }
      }
    }

    add.forEach((p: Paragraph) => {
      obj["new" + addCount++] = p;
    });
    return obj;
  }

  // Links
  public parseLinkTable(aliasList: any): any {
    const linkTable: LinkTable = new LinkTable();
    const aliasTable: AliasTable = new AliasTable();
    const passiveLinkTable: PassiveLinkTable = new PassiveLinkTable();

    for (const alias of aliasList) {
      aliasTable[JSON.stringify(alias.alias_id)] = alias;
      if (alias.link_ids) {
        for (const link of alias.link_ids) {
          linkTable[JSON.stringify(link)] = {
            deleted: false,
            alias_id: alias.alias_id,
          };
        }
      }
      if (alias.passive_links) {
        for (const link of alias.passive_links) {
          passiveLinkTable[JSON.stringify(link.passive_link_id)] = {
            alias_id: alias.alias_id,
            pending: link.pending,
            deleted: false,
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
    const nav = new Array<TreeNode>();
    const temp: TreeNode = {};
    temp.data = new PageSummary();
    temp.data.id = json["segment_id"];
    temp.data.title = json["title"];
    temp.label = json["title"];
    temp.type = "title";
    temp.children = [];
    temp.expanded = true;
    nav.push(temp);
    const pageDic = Array<TreeNode>();
    for (const index in json["segments"]) {
      if (json["segments"].hasOwnProperty(index)) {
        const result = this.jsonToWiki(json["segments"][index], pageDic);
        let tree: TreeNode;
        tree = result[0];
        tree.parent = temp;
        temp.children.push(result[0]);
        pageDic.concat(result[1]);
      }
    }
    for (const index in json["pages"]) {
      if (json["pages"].hasOwnProperty(index)) {
        const result = this.jsonToPage(json["pages"][index]);
        temp.children.push(result);
        result.parent = temp;
        pageDic.push(result.data);
      }
    }

    return [nav, pageDic];
  }

  public jsonToWiki(wikiJson: any, pages: Array<TreeNode>) {
    const wiki: TreeNode = {};

    wiki.data = new PageSummary();
    wiki.children = new Array<TreeNode>();
    wiki.data.id = wikiJson["segment_id"];
    wiki.data.title = wikiJson["title"];
    wiki.label = wikiJson["title"];
    wiki.icon = "fa-book";

    for (const field in wikiJson) {
      if (wikiJson.hasOwnProperty(field)) {
        if (field === "segments") {
          const segmentJsons = wikiJson[field];
          for (const segment in segmentJsons) {
            if (segmentJsons.hasOwnProperty(segment)) {
              const result = this.jsonToWiki(segmentJsons[segment], pages);
              let subsegment: TreeNode;
              subsegment = result[0];
              pages.concat(result[1]);
              subsegment.type = "category";
              subsegment.parent = wiki;

              wiki.children.push(subsegment);
            }
          }
        } else if (field === "pages") {
          const pagesJsons = wikiJson[field];
          for (const page in pagesJsons) {
            if (pagesJsons.hasOwnProperty(page)) {
              const leafpage = this.jsonToPage(pagesJsons[page]);
              pages.push(leafpage);
              leafpage.parent = wiki;
              wiki.children.push(leafpage);
            }
          }
        }
      }
    }
    if (
      typeof wiki.children !== "undefined" &&
      (wiki.children.length === 0 || wiki.children.length !== 0)
    ) {
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
    const page: TreeNode = {};
    page.data = new PageSummary();
    page.data.id = pageJson["page_id"];
    page.data.title = pageJson["title"];
    page.label = pageJson["title"];
    page.type = "page";
    page.icon = "fa-file-text-o";

    return page;
  }

  /**
   * Set the display for the wiki
   */
  public setWikiDisplay(reply: any) {
    let html = "";

    html += "<h1>" + reply["wiki_title"] + "</h1>";
    for (const index in reply["users"]) {
      if (reply["users"].hasOwnProperty(index)) {
        html += "<br>By " + reply["users"][index].name;
      }
    }

    html += "<br><h2>Summary</h2><br>" + reply["summary"];
    return html;
  }

  public setPageDisplay(
    reply: any,
    linktable: LinkTable,
    aliasTable: AliasTable,
    passiveLinkTable: PassiveLinkTable
  ) {
    // getting the alias
    if (reply.aliases) {
      const temp = [];
      let count = 0;
      for (const i in reply.aliases) {
        if (reply.aliases.hasOwnProperty(i)) {
          temp.push({
            index: count,
            state: true,
            name: i,
            icon: "fa-pencil",
            prev: "",
            id: reply.aliases[i],
            main: false,
          });

          if (reply.title === i) {
            temp[count].main = true;
          }

          count++;
        }
      }
      reply.aliases = temp;
    }
    return this.parseReferences(reply, linktable, aliasTable, passiveLinkTable);
  }

  public parseReferences(
    reply: any,
    linktable: LinkTable,
    aliasTable: AliasTable,
    passiveLinkTable: PassiveLinkTable
  ) {
    const refArray = [];
    if (reply.references) {
      for (const ref of reply.references) {
        if (ref.text !== null) {
          const id: string = JSON.stringify(ref.link_id);
          const text: string = ref.text;
          const r1: RegExp = /\s+/g;
          const r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
          let linkMatch: RegExpMatchArray = r2.exec(text);
          while (linkMatch) {
            const linkID: string = linkMatch[0].replace(r1, "");
            let aliasID: ID = new ID();
            const link: Link = linktable[linkID];
            if (link) {
              aliasID = link.alias_id;
              if (aliasID) {
                const alias: Alias = aliasTable[JSON.stringify(aliasID)];
                if (alias) {
                  if (id === linkID) {
                    ref.text = ref.text.replace(
                      linkMatch[0],
                      "<h1>" + alias.alias_name + "</h1>"
                    );
                  } else {
                    ref.text = ref.text.replace(
                      linkMatch[0],
                      "<h2>" + alias.alias_name + "</h2>"
                    );
                  }
                }
              }
            } else {
              const pLink: any = passiveLinkTable[linkID];
              if (pLink && pLink.alias_id) {
                aliasID = pLink.alias_id;
              }
              if (aliasID) {
                const alias: Alias = aliasTable[JSON.stringify(aliasID)];
                if (alias) {
                  if (pLink.pending) {
                    ref.text = ref.text.replace(
                      linkMatch[0],
                      "<h3>" + alias.alias_name + "</h3>"
                    );
                  } else {
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
    }
    reply.references = refArray;
    return reply;
  }

  public findSegment(wiki: TreeNode, sid: any, mode: boolean = true) {
    let found: any;
    if (
      (mode ? JSON.stringify(sid["$oid"]) : JSON.stringify(sid)) ===
      (mode
        ? JSON.stringify(wiki.data.id["$oid"])
        : JSON.stringify(wiki.data.id))
    ) {
      return wiki;
    }
    for (const child of wiki.children) {
      if (
        (mode ? JSON.stringify(sid["$oid"]) : JSON.stringify(sid)) ===
        (mode
          ? JSON.stringify(child.data.id["$oid"])
          : JSON.stringify(child.data.id))
      ) {
        found = child;
        break;
      } else if (
        child.hasOwnProperty("children") &&
        child.children.length !== 0
      ) {
        found = this.findSegment(child, sid, mode);
        if (found) {
          break;
        }
      }
    }
    if (found) {
      return found;
    }
  }

  public findPage(wiki: TreeNode, pid: any, mode: boolean = true) {
    let found: any;
    if (
      (mode ? JSON.stringify(pid["$oid"]) : JSON.stringify(pid)) ===
      (mode
        ? JSON.stringify(wiki.data.id["$oid"])
        : JSON.stringify(wiki.data.id))
    ) {
      return wiki;
    }
    for (const child of wiki.children) {
      if (
        (mode ? JSON.stringify(pid["$oid"]) : JSON.stringify(pid)) ===
        (mode
          ? JSON.stringify(child.data.id["$oid"])
          : JSON.stringify(child.data.id))
      ) {
        found = child;
        break;
      } else if (
        child.hasOwnProperty("children") &&
        child.children.length !== 0
      ) {
        found = this.findPage(child, pid, mode);
        if (found) {
          break;
        }
      }
    }

    if (found) {
      return found;
    }
  }

  public deleteSegment(wiki: TreeNode, segment_id: string) {
    const index: number = wiki.children.findIndex((child: TreeNode) => {
      return JSON.stringify(segment_id) === JSON.stringify(child.data.id);
    });
    if (index !== -1) {
      wiki.children.splice(index, 1);
    } else {
      for (const child of wiki.children) {
        if (child.type === "category") {
          this.deleteSegment(child, segment_id);
        }
      }
    }
  }

  public deletePage(wiki: TreeNode, page_id: string) {
    const index: number = wiki.children.findIndex((child: TreeNode) => {
      return JSON.stringify(page_id) === JSON.stringify(child.data.id);
    });
    if (index !== -1) {
      wiki.children.splice(index, 1);
    } else {
      for (const child of wiki.children) {
        if (child.type === "category") {
          this.deletePage(child, page_id);
        }
      }
    }
  }

  public addSegment(wiki: TreeNode, reply: any) {
    if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
      const idx = this.LastCategory(wiki);
      // when adding a new segment
      const child = {
        parent: wiki,
        data: { title: reply.title, id: reply.segment_id },
        type: "category",
        label: reply.title,
        icon: "fa-book",
        children: [],
      };
      wiki.children.splice(idx, 0, child);
    } else if (wiki.hasOwnProperty("children") && wiki.children.length !== 0) {
      for (const child of wiki.children) {
        console.log(child);
        this.addSegment(child, reply);
      }
    }
  }

  public addPage(wiki: TreeNode, reply: any) {
    if (JSON.stringify(reply.parent_id) === JSON.stringify(wiki.data.id)) {
      wiki.children.push({
        parent: wiki,
        data: { title: reply.title, id: reply.page_id },
        type: "page",
        label: reply.title,
        icon: "fa-file-text-o",
      });
    } else if (wiki.hasOwnProperty("children") && wiki.children.length !== 0) {
      for (const child of wiki.children) {
        this.addPage(child, reply);
      }
    }
  }

  public LastCategory(wiki: TreeNode) {
    const index = this.firstPage(wiki);
    return index;
  }
  public firstPage(wiki: TreeNode) {
    let index: number = wiki.children.findIndex((child: TreeNode) => {
      return child.type === "page";
    });
    if (index === -1) {
      index = wiki.children.length;
    }
    return index;
  }

  public expandPath(page: TreeNode) {
    if (!(page.hasOwnProperty("type") && page.type === "title")) {
      let parent = page.parent;
      while (typeof parent !== "undefined") {
        if (parent.type === "category") {
          parent.expanded = true;
        }
        parent = parent.parent;
      }
    }
  }

  public sort(o1: any, o2: any) {
    if (o1.type === "category" && o2.type === "category") {
      return 0;
    } else if (o1.type === "category" && o2.type === "title") {
      return 1;
    } else if (o1.type === "title" && o2.type === "category") {
      return -1;
    } else if (o1.type === "category" && o2.type === "page") {
      return -1;
    } else if (o1.type === "page" && o2.type === "category") {
      return 1;
    } else if (o1.type === "page" && o2.type === "title") {
      return 1;
    } else if (o1.type === "title" && o2.type === "page") {
      return -1;
    } else {
      return 0;
    }
  }

  /*Stats*/
  public parseWordFrequency(reply: any) {
    const wordFreq = Array<Word>();
    for (const words in reply) {
      if (reply.hasOwnProperty(words)) {
        wordFreq.push({
          word: words,
          count: reply[words],
        });
      }
    }
    wordFreq.sort((a: Word, b: Word) => {
      const diff: number = b.count - a.count;
      if (diff === 0) {
        return a.word.localeCompare(b.word);
      } else {
        return diff;
      }
    });
    return wordFreq;
  }

  public flattenTree(tree: TreeNode) {
    const arr = this.getTreeArray(tree);
    const dict = {};

    for (const ele of arr) {
      dict[JSON.stringify(ele.data.section_id)] = ele.data;
    }

    return dict;
  }

  public getTreeArray(tree: TreeNode, mode: boolean = false) {
    let arr = [];
    if (!mode) {
      arr.push(tree);
    } else {
      if (tree.type === "page") {
        arr.push(tree);
      }
    }
    for (const i in tree.children) {
      if (tree.children.hasOwnProperty(i)) {
        arr = arr.concat(this.getTreeArray(tree.children[i], mode));
      }
    }
    return arr;
  }

  public parsePageFrequency(stats: any, wikiPages: any, sections: any) {
    const result = {};
    let count = [];
    let secList: any;
    let val: Number;

    for (const index in stats) {
      if (stats.hasOwnProperty(index)) {
        count = [];
        secList = stats[index].section_frequencies;

        for (const section in sections) {
          if (sections.hasOwnProperty(section)) {
            val = secList[section.substr(0, 8) + " " + section.substr(8)];
            if (val === undefined) {
              val = 0;
            }
            count.push(val);
          }
        }
        result[JSON.stringify(stats[index].page_id)] = count;
      }
    }

    return result;
  }

  public parseContentPDF(
    paragraphs: Paragraph[],
    aliasTable: AliasTable,
    linkTable: LinkTable,
    passiveLinkTable: PassiveLinkTable
  ): any {
    for (const paragraph of paragraphs) {
      // Parse the current paragraph
      this.parseParagraphPDF(
        paragraph,
        aliasTable,
        linkTable,
        passiveLinkTable
      );
    }
    return paragraphs;
  }

  // Parse the links/notes of a paragraph
  public parseParagraphPDF(
    paragraph: Paragraph,
    aliasTable: AliasTable,
    linkTable: LinkTable,
    passiveLinkTable: PassiveLinkTable
  ) {
    paragraph.links = new AliasTable();
    paragraph.passiveLinks = new AliasTable();

    const text: string = paragraph.text;
    const r1: RegExp = /\s+/g;
    const r2: RegExp = /{"\$oid":\s*"[a-z0-9]{24}"}/g;
    let linkMatch: RegExpMatchArray = r2.exec(text);
    while (linkMatch) {
      const linkID: string = linkMatch[0].replace(r1, "");

      let aliasID: ID = new ID();
      const link: Link = linkTable[linkID];
      if (link) {
        aliasID = link.alias_id;
        if (aliasID) {
          const alias: Alias = aliasTable[JSON.stringify(aliasID)];
          if (alias) {
            paragraph.links[linkID] = alias;
            paragraph.text = paragraph.text.replace(
              linkMatch[0],
              alias.alias_name
            );
          }
        }
      } else {
        const passiveLink: PassiveLink = passiveLinkTable[linkID];
        if (passiveLink) {
          const alias: Alias = aliasTable[JSON.stringify(passiveLink.alias_id)];
          if (alias) {
            paragraph.passiveLinks[linkID] = alias;
            paragraph.text = paragraph.text.replace(
              linkMatch[0],
              alias.alias_name
            );
          }
        }
      }
      linkMatch = r2.exec(text);
    }
  }

  public setContentDisplayPDF(paragraphs: Paragraph[]): string {
    let content = "";
    for (const paragraph of paragraphs) {
      if (paragraph.paragraph_id) {
        content += "<p>" + paragraph.text + "</p>";
      }
    }
    return content;
  }
}
