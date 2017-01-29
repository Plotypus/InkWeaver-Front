import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

import { WebSocketService } from './websocket.service';
import { ParserService } from './parser.service';

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

const url: string = 'ws://localhost:8080/ws/demo';

@Injectable()
export class ApiService {
    public data = {
        inflight: false,
        user: new User(),
        stories: new Array<StorySummary>(),
        wikis: new Array<WikiSummary>(),

        storyNode: [],
        storyDisplay: '',
        story: new Story(),
        section: new Section(),
        content: new Array<Paragraph>(),

        tooltip: { text: '', display: 'none' },
        oldObj: [],

        wikiNode: [],
        wikiDisplay: '',
        wiki: new Wiki(),
        segment: new Segment(),
        page: new Page()
    }

    public outgoing = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(
        private socket: WebSocketService,
        private parser: ParserService) { }

    public connect() {
        this.messages = <Subject<string>>this.socket.connect(url)
            .map((res: MessageEvent) => {
                this.data.inflight = false;

                let response: string = res.data;
                let reply = JSON.parse(response);
                let message_id: number = reply.with_reply_id;
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
                        this.send({
                            action: 'get_section_content',
                            section_id: reply.section_id
                        });
                        this.send({
                            action: 'get_wiki_information',
                            wiki_id: reply.wiki_id
                        });
                        this.send({
                            action: 'get_wiki_hierarchy',
                            wiki_id: reply.wiki_id
                        });
                        break;
                    case 'get_story_hierarchy':
                        this.data.section = reply.hierarchy;
                        this.data.storyNode = [
                            this.parser.sectionToTree(this.parser, reply.hierarchy)
                        ];
                        break;
                    case 'get_section_hierarchy':
                        this.data.section = reply.hierarchy;
                        this.data.storyNode = [
                            this.parser.sectionToTree(this.parser, reply.hierarchy)
                        ];
                        break;
                    case 'get_section_content':
                        this.data.content = reply.content;
                        this.data.storyDisplay = this.parser.setContentDisplay(reply.content);
                        this.data.oldObj = this.parser.parseHtml(this.data.storyDisplay);
                        break;

                    case 'get_wiki_information':
                        this.data.wiki = reply;
                        this.data.wikiDisplay = this.parser.setPageDisplay();
                        break;
                    case 'get_wiki_hierarchy':
                        this.data.segment = reply.hierarchy;
                        this.data.wikiNode = [
                            this.parser.segmentToTree(this.parser, reply.hierarchy)
                        ];
                        break;
                    case 'get_wiki_segment_hierarchy':
                        this.data.segment = reply.hierarchy;
                        this.data.wikiNode = [
                            this.parser.segmentToTree(this.parser, reply.hierarchy)
                        ];
                        break;
                    case 'get_wiki_page':
                        this.data.page = reply;
                        this.data.tooltip.text = reply.title;
                        this.data.wikiDisplay = this.parser.setPageDisplay();
                        break;

                    default:
                        console.log('Unknown action: ' + action)
                        break;
                }
                delete this.outgoing[message_id];
                return action;
            });
        this.messages.subscribe((message: string) => {
            console.log(message);
        });
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