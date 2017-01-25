import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { Section } from '../models/section.model';
import { Segment } from '../models/segment.model';
import { Paragraph } from '../models/paragraph.model';
import { PageSummary } from '../models/page-summary.model';

@Injectable()
export class DataParserService {
    public sectionToTree(dataParserService: DataParserService, story: Section): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.data = {
            title: story.title,
            section_id: story.section_id
        };

        let sectionToTree: (story: Section) => TreeNode = (story: Section) => {
            return dataParserService.sectionToTree(dataParserService, story);
        };

        treeNode.children = story.preceding_subsections.map(sectionToTree)
            .concat(story.inner_subsections.map(sectionToTree))
            .concat(story.succeeding_subsections.map(sectionToTree));
        treeNode.leaf = treeNode.children.length == 0;

        return treeNode;
    }

    public segmentToTree(dataParserService: DataParserService, wiki: Segment): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.data = {
            title: wiki.title,
            segment_id: wiki.segment_id
        };

        let segmentToTree: (wiki: Segment) => TreeNode = (wiki: Segment) => {
            return dataParserService.segmentToTree(dataParserService, wiki);
        };

        treeNode.children = wiki.segments.map(segmentToTree)
            .concat(wiki.pages.map(dataParserService.pageToTree));
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
        for (let paragraph of paragraphs) {
            content += '<p>' + paragraph.text + '</p>';
        }
        return content;
    }

    /**
     * Set the display for the wiki
     */
    public setPageDisplay(): string {
        return 'Page';
    }
}