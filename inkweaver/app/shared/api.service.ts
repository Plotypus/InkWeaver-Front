import { Injectable } from '@angular/core';
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
const urlAuth: string = 'wss://inkweaver.plotypus.net:8080/ws';

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
        selectedEntry: {},
        tooltip: new Tooltip(),
        contentObject: new ContentObject()
    }

    public acknowledged: boolean = false;
    public authentication: boolean = false;

    public queued: string[] = [];
    public outgoing: Object = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(
        private socket: WebSocketService,
        private parser: ParserService) { }

    public connect() {
        let path: string = this.authentication ? urlAuth : url;

        this.messages = <Subject<string>>this.socket.connect(path)
            .map((res: MessageEvent) => {
                this.data.inflight = false;
                let response: string = res.data;
                let reply = JSON.parse(response);

                if (reply) {
                    // ---------- Acknowledged ---------- //
                    if (reply.event == 'acknowledged') {
                        this.acknowledged = true;
                        for (let queue of this.queued) {
                            this.messages.next(queue);
                        }
                        return reply.event;
                    }

                    // Extract the fields from the original message
                    if (!reply.reply_to_id) {
                        reply = JSON.parse(reply);
                    }
                    let message_id: number = reply.reply_to_id;
                    let out: any = this.outgoing[message_id];

                    let action: string = out.action;
                    let callback: Function = out.callback;
                    let metadata: any = out.metadata;

                    // Perform callback if necessary
                    // And delete the entry for the original message
                    callback(reply);
                    delete this.outgoing[message_id];

                    if (reply.event) {
                        // ---------- Event ---------- //
                        if (reply.event == 'story_deleted') {
                            this.refreshUser();
                        } else if (reply.event == 'alias_deleted') {
                            this.refreshContent();
                        } else if (reply.event == 'section_deleted') {
                            this.refreshStoryHierarchy();
                        } else if (reply.event == 'paragraph_deleted') {
                            if (Object.keys(this.outgoing).length == 0) {
                                this.refreshContent();
                            }
                        } else if (reply.event == 'link_deleted') {
                            if (Object.keys(this.outgoing).length == 0) {
                                this.refreshContent();
                            }
                        }
                        return reply.event;
                    } else {
                        // ---------- Action ---------- //
                        switch (action) {
                            // ---------- User ---------- //
                            case 'get_user_preferences':
                                this.data.user = reply;
                                break;
                            case 'get_user_stories':
                                this.data.stories = reply.stories;
                                this.data.stories.push({ story_id: null, title: null, access_level: null, position_context: null });
                                break;
                            case 'get_user_wikis':
                                this.data.wikis = reply.wikis;
                                break;

                            // ---------- Story ---------- //
                            case 'create_story':
                                this.data.story = reply;
                                this.refreshUser();
                                this.refreshStoryHierarchy(reply.story_id);
                            case 'get_story_information':
                                reply.story_id = this.data.story.story_id;
                                reply.position_context = this.data.story.position_context;
                                this.data.story = reply;
                                this.data.wiki.wiki_id = reply.wiki_id;
                                this.refreshWikiInfo(reply.wiki_id);
                                this.refreshWikiHierarchy(reply.wiki_id);
                                break;
                            case 'get_story_hierarchy':
                            case 'get_section_hierarchy':
                                this.data.storyNode = [this.parser.sectionToTree(this.parser, reply.hierarchy, null)];

                                if (this.data.story.position_context && this.data.story.position_context.section_id) {
                                    this.data.section.data = { section_id: this.data.story.position_context.section_id };
                                } else if (!this.data.section.data) {
                                    this.data.section = this.data.storyNode[0];
                                }

                                this.data.section = this.parser.setSection(this.data.storyNode[0], JSON.stringify(this.data.section.data.section_id));
                                this.data.prevSection = this.data.section;
                                this.refreshContent();
                                break;
                            case 'get_section_content':
                                this.data.content = reply.content;
                                this.data.contentObject = this.parser.parseContent(reply.content, this.data.linkTable);
                                this.data.storyDisplay = this.parser.setContentDisplay(reply.content);
                                if (JSON.stringify(metadata.sectionID) == JSON.stringify(this.data.story.section_id)) {
                                    if (!this.data.storyDisplay) {
                                        this.data.storyDisplay = '<p><em>Write a summary here!</em></p>';
                                    }
                                    this.data.storyDisplay = '<h1>Summary</h1>' + this.data.storyDisplay + '<h1>Table of Contents</h1>' + this.setTableOfContents(this.data.storyNode[0], 0);
                                } else {
                                    this.data.storyDisplay = '<h1>' + metadata.title + '</h1>' + this.data.storyDisplay;
                                }
                                break;

                            case 'add_inner_subsection':
                                this.refreshStoryHierarchy();
                                break
                            case 'edit_section_title':
                                this.refreshUser();
                                this.refreshStoryHierarchy();
                                break

                            case 'add_paragraph':
                            case 'edit_paragraph':
                                if (Object.keys(this.outgoing).length == 0) {
                                    this.refreshContent();
                                }
                                break;

                            // ---------- Link ---------- //
                            case 'create_link':
                                if (Object.keys(this.outgoing).length == 0) {
                                    this.refreshContent();
                                }
                                break;

                            // ---------- Wiki ---------- //
                            case 'create_wiki':
                                this.data.wiki = reply;
                                this.refreshUser();
                                this.refreshWikiHierarchy(reply.wiki_id);
                            case 'get_wiki_information':
                                reply.wiki_id = this.data.wiki.wiki_id;
                                this.data.wiki = reply;
                                this.data.wikiDisplay = this.parser.setWikiDisplay(reply);
                                break;
                            case 'get_wiki_hierarchy':
                            case 'get_wiki_segment_hierarchy':
                                this.data.segment = reply.hierarchy;
                                this.data.wikiNav = this.parser.parseWiki(reply.hierarchy, this.data.selectedEntry);
                                this.data.linkTable = this.parser.parseLinkTable(reply.link_table);
                                break;
                            case 'get_wiki_segment':
                                reply = JSON.parse(JSON.stringify(reply).replace("template_headings", "headings"));
                                this.data.page = reply;
                                break;
                            case 'get_wiki_page':
                                this.data.page = this.parser.setPageDisplay(reply, this.data.linkTable);
                                this.data.tooltip.text = '<b>' + reply.title + '</b>';
                                if (reply.headings && reply.headings[0]) {
                                    this.data.tooltip.text += '<br/><u>' + reply.headings[0].title + '</u><br/>' + reply.headings[0].text;
                                }
                                break;
                            case 'add_page':
                                this.data.pageid.push(reply.page_id);
                                this.refreshWikiHierarchy();
                                break;
                            case 'add_segment':
                                this.data.pageid.push(reply.segment_id);
                                this.refreshWikiHierarchy();
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
                                this.refreshWikiHierarchy();
                                this.refreshContent();
                                break;

                            default:
                                console.log('Unknown action: ' + action)
                                break;
                        }
                        return action;
                    }
                }
                return 'unknown';
            });
        this.messages.subscribe((action: string) => {
            console.log(action);
        });
    }

    // USER
    public refreshUser() {
        this.send({ action: 'get_user_preferences' });
        this.send({ action: 'get_user_stories' });
        this.send({ action: 'get_user_wikis' });
    }

    // STORY
    public refreshStoryInfo(storyID: ID = this.data.story.story_id) {
        this.send({ action: 'get_story_information', story_id: storyID });
    }
    public refreshStoryHierarchy(storyID: ID = this.data.story.story_id) {
        this.send({ action: 'get_story_hierarchy', story_id: storyID });
    }
    public refreshContent(sectionID: ID = this.data.section.data.section_id, sectionTitle: string = this.data.section.data.title,paraID:any = "") {
        this.send({ action: 'get_section_content', section_id: sectionID }, (reply: any) => { }, { sectionID: sectionID, title: sectionTitle,paragraphID:paraID});
    }
    public setTableOfContents(storyNode: TreeNode, indent: number): string {
        let result: string = '<a href="sid' + storyNode.data.section_id.$oid + '">' + storyNode.data.title + '</a>';
        if (indent == 0) {
            result = '<h3>' + result + '</h3>';
        }
        if (storyNode.children) {
            result += '<ul>';
            for (let node of storyNode.children) {
                result += '<li class=ql-indent-' + indent + '>' + this.setTableOfContents(node, indent + 1) + '</li>';
            }
            result += '</ul>';
        }
        return result;
    }

    // WIKI
    public refreshWikiInfo(wikiID: ID = this.data.story.wiki_id) {
        this.send({ action: 'get_wiki_information', wiki_id: wikiID });
    }
    public refreshWikiHierarchy(wikiID: ID = this.data.story.wiki_id) {
        this.send({ action: 'get_wiki_hierarchy', wiki_id: wikiID });
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

        // Send or queue the message
        console.log(message);
        if (this.acknowledged) {
            this.messages.next(message);
        } else {
            this.queued.push(message);
        }
    }
}