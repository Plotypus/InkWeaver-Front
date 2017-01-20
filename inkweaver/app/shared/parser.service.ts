import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { WebSocketService } from './websocket.service';
import { TreeNode } from 'primeng/primeng';

import { User } from '../models/user.model';
import { StorySummary } from '../models/story-summary.model';
import { Story } from '../models/story.model';
import { Section } from '../models/section.model';
import { Paragraph } from '../models/paragraph.model';
import { WikiSummary } from '../models/wiki-summary.model';
import { Wiki } from '../models/wiki.model';
import { Segment } from '../models/segment.model';
import { PageSummary } from '../models/page-summary.model';
import { Page } from '../models/page.model';

const url: string = 'ws://localhost:8080/ws/v2/test';

@Injectable()
export class ParserService {
    public data = {
        inflight: false,
        user: new User(),
        stories: new Array<StorySummary>(),
        wikis: new Array<WikiSummary>(),

        storyNode: {},
        storyDisplay: '',
        story: new Story(),
        section: new Section(),
        content: new Array<Paragraph>(),

        wikiNode: {},
        wikiDisplay: '',
        wiki: new Wiki(),
        segment: new Segment(),
        page: new Page()
    }

    public outgoing = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(private socket: WebSocketService) { }

    public connect() {
        this.messages = <Subject<string>>this.socket
            .connect(url).map((response: MessageEvent): string => response.data);
    }

    public receive(): Observable<string> {
        return this.messages.map((response: string) => {
            this.data.inflight = false;

            let reply = JSON.parse(response);
            let message_id: number = reply.reply_to_id;
            let action: string = this.outgoing[message_id];

            switch (action) {
                case 'get_user_preferences':
                    this.data.user = reply;
                    break;
                case 'get_user_stories':
                    this.data.stories = reply.stories;
                    break;
                case 'get_user_wikis':
                    this.data.wikis = reply.wikis;
                    break;

                case 'get_story_information':
                    this.data.story = reply;
                    this.data.storyDisplay = this.setStoryDisplay();
                    break;
                case 'get_story_hierarchy':
                    this.data.section = reply.hierarchy;
                    this.data.storyNode = this.sectionToTree(reply.hierarchy);
                    break;
                case 'get_section_hierarchy':
                    this.data.section = reply.hierarchy;
                    this.data.storyNode = this.sectionToTree(reply.hierarchy);
                    break;
                case 'get_section_content':
                    this.data.content = reply.content;
                    this.data.storyDisplay = this.setContentDisplay();
                    break;

                case 'get_wiki_information':
                    this.data.wiki = reply;
                    this.data.wikiDisplay = this.setWikiDisplay();
                    break;
                case 'get_wiki_hierarchy':
                    this.data.segment = reply.hierarchy;
                    this.data.wikiNode = this.segmentToTree(reply.hierarchy);
                    break;
                case 'get_wiki_segment_hierarchy':
                    this.data.segment = reply.hierarchy;
                    this.data.wikiNode = this.segmentToTree(reply.hierarchy);
                    break;
                case 'get_wiki_page':
                    this.data.page = reply;
                    this.data.wikiDisplay = this.setPageDisplay();
                    break;

                default:
                    console.log('Unknown action: ' + action)
                    break;
            }
            delete this.outgoing[message_id];
            return action;
        });
    }

    public sectionToTree(story: Section): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.label = story.title;
        treeNode.data = {
            section_id: story.section_id
        };
        treeNode.children = story.preceding_subsections.map(this.sectionToTree)
            .concat(story.inner_subsections.map(this.sectionToTree))
            .concat(story.succeeding_subsections.map(this.sectionToTree));
        treeNode.leaf = treeNode.children.length == 0;

        return treeNode;
    }

    public segmentToTree(wiki: Segment): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.label = wiki.title;
        treeNode.data = {
            segment_id: wiki.segment_id
        };
        treeNode.children = wiki.segments.map(this.segmentToTree)
            .concat(wiki.pages.map(this.pageToTree));
        treeNode.leaf = false;

        return treeNode;
    }

    public pageToTree(page: PageSummary): TreeNode {
        let treeNode: TreeNode = {};

        treeNode.label = page.title;
        treeNode.data = {
            page_id: page.page_id
        };
        treeNode.leaf = true;

        return treeNode;
    }

    /**
     * Set the display for the story
     */
    public setStoryDisplay() {
        return 'Story';
    }

    /**
     * Set the display for the content
     */
    public setContentDisplay() {
        return 'Content';
    }

    /**
     * Set the display for the wiki
     */
    public setWikiDisplay() {
        return 'Wiki';
    }

    /**
     * Set the display for a page
     */
    public setPageDisplay() {
        return 'Page';
    }

    /**
     * Send a message on the WebSocket
     * @param {JSON} message - A JSON-formatted message
     */
    public send(message: any) {
        message.message_id = ++this.message_id;
        this.outgoing[message.message_id] = message.action;

        this.data.inflight = true;
        this.messages.next(message);
    }
}