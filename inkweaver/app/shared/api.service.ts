﻿import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { MenuItem, TreeNode } from 'primeng/primeng';

import { WebSocketService } from './websocket.service';
import { ParserService } from './parser.service';

// Models
import { User } from '../models/user/user.model';
import { Collaborator } from '../models/user/collaborator.model';

import { LinkTable } from '../models/link/link-table.model';
import { Link } from '../models/link/link.model';
import { ID } from '../models/id.model';

import { StorySummary } from '../models/story/story-summary.model';
import { Story } from '../models/story/story.model';
import { Section } from '../models/story/section.model';
import { Paragraph } from '../models/story/paragraph.model';
import { Tooltip } from '../models/story/tooltip.model';
import { ContentObject } from '../models/story/content-object.model';

import { WikiSummary } from '../models/wiki/wiki-summary.model';
import { Wiki } from '../models/wiki/wiki.model';
import { Segment } from '../models/wiki/segment.model';
import { PageSummary } from '../models/wiki/page-summary.model';
import { Page } from '../models/wiki/page.model';
import { Heading } from '../models/wiki/heading.model';
import { Reference } from '../models/wiki/reference.model';

const url: string = 'ws://localhost:8080/ws/demo';

@Injectable()
export class ApiService {
    public data = {
        inflight: false,
        menuItems: new Array<MenuItem>(),

        user: new User(),
        stories: new Array<StorySummary>(),
        wikis: new Array<WikiSummary>(),
        linkTable: new LinkTable(),

        storyDisplay: '',
        story: new Story(),
        prevSection: new Section(),
        section: new Section(),
        content: new Array<Paragraph>(),
        storyNode: new Array<TreeNode>(),

        wikiNav: [],
        wikiNode: [],
        wikiDisplay: '',
        wiki: new Wiki(),
        segment: new Segment(),
        page: new Page(),
        pageid: [],

        tooltip: new Tooltip(),
        contentObject: new ContentObject()
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
                if (reply.event == 'acknowledged') {
                    this.outgoing = {};
                    return reply.event;
                }

                if (!reply.reply_to_id) {
                    reply = JSON.parse(reply);
                }
                let message_id: number = reply.reply_to_id;
                let out: any = this.outgoing[message_id];
                let action: string = out.action;
                let callback: Function = out.callback;
                let metadata: any = out.metadata;
                delete this.outgoing[message_id];

                if (reply.event) {
                    if (reply.event == 'alias_deleted') {
                        this.refreshContent();
                    } else if (reply.event == 'section_deleted') {
                        this.refreshStory();
                    }
                    return reply.event;
                } else {
                    switch (action) {
                        case 'get_user_preferences':
                            this.data.user = reply;
                            break;
                        case 'get_user_stories':
                            this.data.stories = reply.stories;
                            this.data.stories.push({
                                story_id: null,
                                title: null,
                                access_level: null
                            });
                            break;
                        case 'get_user_wikis':
                            this.data.wikis = reply.wikis;
                            break;

                        case 'create_story':
                            this.data.story = reply;
                            this.refreshUser();
                            this.refreshStory(reply.story_id);
                        case 'get_story_information':
                            reply.story_id = this.data.story.story_id;
                            this.data.story = reply;
                            this.data.wiki.wiki_id = reply.wiki_id;
                            this.refreshWiki(reply.wiki_id, true);
                            break;
                        case 'get_story_hierarchy':
                        case 'get_section_hierarchy':
                            if (!this.data.section.data) {
                                this.data.section.data = { section_id: reply.hierarchy.section_id };
                            }
                            this.data.storyNode = [this.parser.sectionToTree(this.parser, reply.hierarchy, null)];
                            this.data.section = this.parser.setSection(this.data.storyNode[0], JSON.stringify(this.data.section.data.section_id));
                            this.data.prevSection = this.data.section;
                            this.refreshContent();
                            break;
                        case 'get_section_content':
                            this.data.content = reply.content;
                            this.data.contentObject = this.parser.parseContent(reply.content, this.data.linkTable);
                            if (!metadata.nocontent) {
                                this.data.storyDisplay = this.parser.setContentDisplay(reply.content);
                                callback(reply);
                            }
                            break;

                        case 'add_inner_subsection':
                            this.refreshStory();
                            break
                        case 'edit_section_title':
                            this.refreshUser();
                            this.refreshStory(this.data.story.story_id, true);
                            break

                        case 'add_paragraph':
                        case 'edit_paragraph':
                        case 'delete_paragraph':
                            callback(reply);
                            if (Object.keys(this.outgoing).length == 0) {
                                this.refreshContent(this.data.section.data.section_id,
                                    { nocontent: true, noflight: true });
                            }
                            break;

                        case 'create_link':
                        case 'delete_link':
                            callback(reply);
                            if (Object.keys(this.outgoing).length == 0) {
                                this.refreshContent(this.data.section.data.section_id,
                                    { nocontent: true, noflight: true });
                            }
                            break;

                        case 'create_wiki':
                            this.data.wiki = reply;
                            this.refreshUser();
                            this.refreshWiki(reply.wiki_id);
                        case 'get_wiki_information':
                            reply.wiki_id = this.data.wiki.wiki_id;
                            this.data.wiki = reply;
                            this.data.wikiDisplay = this.parser.setWikiDisplay(reply);
                            break;
                        case 'get_wiki_hierarchy':
                        case 'get_wiki_segment_hierarchy':
                            this.data.segment = reply.hierarchy;
                            this.data.wikiNav = this.parser.parseWiki(reply.hierarchy);
                            this.data.linkTable = this.parser.parseLinkTable(reply.link_table);
                            break;
                        case 'get_wiki_segment':
                            reply = JSON.parse(JSON.stringify(reply).replace("template_headings", "headings"));
                            this.data.page = reply;
                            break;
                        case 'get_wiki_page':
                            this.data.page = reply;
                            this.data.tooltip.text = '<b>' + reply.title + '</b>';
                            if (reply.headings && reply.headings[0]) {
                                this.data.tooltip.text += '<br/><u>' + reply.headings[0].title + '</u><br/>' + reply.headings[0].text;
                            }
                            break;
                        case 'add_page':
                            this.data.pageid.push(reply.page_id);
                            this.refreshWiki();
                            break;
                        case 'add_segment':
                            this.data.pageid.push(reply.segment_id);
                            this.refreshWiki();
                            break;
                        case 'add_template_heading':
                            break;
                        case 'add_heading':
                            break;
                        case 'create_wiki':
                            break;
                        case 'edit_segment':
                            break;
                        case 'edit_page':
                            break;
                        case 'edit_heading':
                            break;
                        case 'change_alias_name':
                            this.refreshWiki();
                            this.refreshContent();
                            break;

                        default:
                            console.log('Unknown action: ' + action)
                            break;
                    }
                    return action;
                }
            });
        this.messages.subscribe((action: string) => {
            console.log(action);
        });
    }

    public refreshUser() {
        this.send({ action: 'get_user_preferences' });
        this.send({ action: 'get_user_stories' });
        this.send({ action: 'get_user_wikis' });
    }

    public refreshStory(storyId: ID = this.data.story.story_id, info: boolean = false) {
        if (info) {
            this.send({ action: 'get_story_information', story_id: storyId });
        }
        this.send({ action: 'get_story_hierarchy', story_id: storyId });
    }

    public refreshContent(sectionId: ID = this.data.section.data.section_id, metadata: any = {}) {
        this.send({ action: 'get_section_content', section_id: sectionId }, (reply: any) => {
            if (JSON.stringify(sectionId) == JSON.stringify(this.data.story.section_id)) {
                this.data.storyDisplay = '<h1>Summary</h1>' + this.data.storyDisplay;
            }
        }, metadata);
    }

    public refreshWiki(wikiId: ID = this.data.story.wiki_id,
        info: boolean = false, wikis: boolean = false) {
        if (info) {
            this.send({ action: 'get_wiki_information', wiki_id: wikiId });
        }
        this.send({ action: 'get_wiki_hierarchy', wiki_id: wikiId });
    }

    /**
     * Send a message on the WebSocket
     * @param {JSON} message - A JSON-formatted message
     */
    public send(message: any, callback: (reply: any) => void = (reply: any) => { }, metadata: any = {}) {
        message.message_id = ++this.message_id;
        this.outgoing[message.message_id] = {
            action: message.action,
            callback: callback,
            metadata: metadata
        };

        if (!metadata.noflight) {
            this.data.inflight = true;
        }

        console.log(message);
        this.messages.next(message);
    }
}