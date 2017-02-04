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
                content += '<p><code>' + paragraphs[i].paragraph_id + '</code>'
                    + paragraphs[i].text + '</p>';
            }
        }
        return content;
    }

    /**
     * Set the display for the wiki
     */
    public setPageDisplay(): string {
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