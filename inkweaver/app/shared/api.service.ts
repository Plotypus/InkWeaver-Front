import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { MenuItem, TreeNode, SelectItem } from 'primeng/primeng';

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


import { Stats } from '../models/stats/stats.model';
const url: string = 'ws://localhost:8080/ws';
const urlAuth: string = 'ws://inkweaver.plotypus.net:8080/ws';

@Injectable()
export class ApiService {
    public data = {
        inflight: false,
        tooltip: new Tooltip(),
        menuItems: new Array<MenuItem>(),

        user: new User(),
        stories: new Array<StorySummary>(),
        wikis: new Array<WikiSummary>(),
        linkTable: new LinkTable(),
        aliasTable: new AliasTable(),

        storyDisplay: '',
        story: new Story(),
        prevSection: new Section(),
        section: new Section(),
        storyNode: new Array<TreeNode>(),
        contentObject: new ContentObject(),
        bookmarks: new Array<TreeNode>(),

        statSection: new Section(),
        statSegment: new Segment(),
        stats: new Stats(),
        statsPages: {},
        statsSections: {},
        statsPageFrequency: {},

        wikiNav: [],
        wikiDisplay: '',
        wiki: new Wiki(),
        segment: new Segment(),
        page: new Page(),
        selectedEntry: {}
    };

    public uuid: string;
    public authentication: boolean = false;
    public subscribedToWiki: boolean = false;
    public subscribedToStory: boolean = false;

    public queued: any[] = [];
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
                    // Extract the fields from the original message
                    let index: number = 0;
                    let metadata: any = {};
                    let callback: Function = () => { };
                    let identifier: any = reply.identifier;
                    if (identifier) {
                        let message_id: number = identifier.message_id;
                        if (message_id && this.outgoing[message_id]) {
                            callback = this.outgoing[message_id].callback;
                            metadata = this.outgoing[message_id].metadata;

                            // Perform callback if necessary
                            // And delete the entry for the original message
                            callback(reply);
                            delete this.outgoing[message_id];
                        }
                    }

                    if (reply.event) {
                        switch (reply.event) {
                            case 'acknowledged':
                                this.uuid = reply.uuid;
                                for (let queue of this.queued) {
                                    queue.identifier.uuid = reply.uuid;
                                    console.log(queue);
                                    this.messages.next(queue);
                                }
                                break;

                            // ---------- User ---------- //
                            case 'got_user_preferences':
                                this.data.user = reply;
                                break;
                            case 'got_user_stories_and_wikis':
                                this.data.stories = reply.stories;
                                this.data.stories.push({
                                    story_id: null, title: null,
                                    access_level: null, position_context: null, wiki_summary: null
                                });
                                this.data.wikis = reply.wikis;
                                this.data.wikis.push({
                                    wiki_id: null, title: null,
                                    access_level: null
                                });
                                break;

                            // ----- Story ----- //
                            case 'story_created':
                                this.data.stories.push(reply);
                                break;
                            case 'story_updated':
                                this.data.story.story_title = reply.update.title;
                                this.data.storyNode[0].data.title = reply.update.title;
                                break;
                            case 'story_deleted':
                                break;

                            case 'subscribed_to_story':
                                this.subscribedToStory = true;
                                this.refreshStoryInfo();
                                this.refreshStoryHierarchy();
                                this.refreshBookmarks();
                                break;
                            case 'unsubscribed_from_story':
                                this.subscribedToStory = false;
                                break;

                            case 'got_story_information':
                                reply.story_id = this.data.story.story_id;
                                reply.position_context = this.data.story.position_context;
                                this.data.story = reply;
                                break;
                            case 'got_story_hierarchy':
                            case 'got_section_hierarchy':
                                this.data.storyNode = [this.parser.sectionToTree(this.parser, reply.hierarchy, null)];

                                if (this.data.story.position_context && this.data.story.position_context.section_id) {
                                    this.data.section.data = {
                                        section_id: this.data.story.position_context.section_id
                                    };
                                } else if (!this.data.section.data) {
                                    this.data.section = this.data.storyNode[0];
                                }

                                this.data.section = this.parser.setSection(this.data.storyNode[0], JSON.stringify(this.data.section.data.section_id));
                                this.data.prevSection = this.data.section;
                                this.data.statsSections = this.parser.flattenTree(this.data.storyNode[0]);
                                if (!this.data.storyDisplay) {
                                    this.refreshStoryContent();
                                }
                                break;
                            case 'got_section_content':
                                this.data.contentObject = this.parser.parseContent(reply.content, this.data.linkTable);
                                this.data.storyDisplay = this.parser.setContentDisplay(reply.content);
                                this.data.section = this.parser.setSection(this.data.storyNode[0], JSON.stringify(metadata.sectionID));

                                this.data.story.position_context = metadata.positionContext;
                                if (JSON.stringify(metadata.sectionID) === JSON.stringify(this.data.story.section_id)) {
                                    if (!this.data.storyDisplay) {
                                        this.data.storyDisplay = '<p><em>Write a summary here!</em></p>';
                                    }
                                    this.data.storyDisplay = '<h1>Summary</h1>' + this.data.storyDisplay;
                                } else {
                                    this.data.storyDisplay = '<h1>' + metadata.title + '</h1>' + this.data.storyDisplay;
                                }
                                break;

                            // Section
                            case 'inner_subsection_added':
                                this.parser.addSection(this.data.storyNode[0], reply);
                                break;
                            case 'section_title_updated':
                                this.parser.updateSection(this.data.storyNode[0], JSON.stringify(reply.section_id), reply.new_title);
                                break;
                            case 'section_deleted':
                                this.parser.deleteSection(this.data.storyNode[0], JSON.stringify(reply.section_id));
                                break;

                            // Bookmarks
                            case 'got_story_bookmarks':
                                this.data.bookmarks = [{ data: { name: 'Bookmarks', bookmark_id: { $oid: null } }, expanded: true, children: [] }];
                                for (let bookmark of reply.bookmarks) {
                                    bookmark.index = this.data.bookmarks[0].children.length;
                                    this.data.bookmarks[0].children.push({ data: bookmark, parent: this.data.bookmarks[0] });
                                }
                                break;
                            case 'bookmark_added':
                                reply.index = reply.index ? reply.index : this.data.bookmarks[0].children.length;
                                this.data.bookmarks[0].children.splice(reply.index, 0, { data: reply, parent: this.data.bookmarks[0] });
                                break;
                            case 'bookmark_updated':
                                index = this.data.bookmarks[0].children.findIndex((bookmark: TreeNode) => JSON.stringify(reply.bookmark_id) === JSON.stringify(bookmark.data.bookmark_id));
                                this.data.bookmarks[0].children[index].data.name = reply.update.name;
                                break;
                            case 'bookmark_deleted':
                                index = this.data.bookmarks[0].children.findIndex((bookmark: TreeNode) => JSON.stringify(reply.bookmark_id) === JSON.stringify(bookmark.data.bookmark_id));
                                this.data.bookmarks[0].children.splice(index, 1);
                                break;

                            // Links
                            case 'link_created':
                                this.data.linkTable[JSON.stringify(reply.link_id)] = {
                                    page_id: reply.page_id, name: reply.name
                                }
                                break;
                            case 'link_deleted':
                                delete this.data.linkTable[JSON.stringify(reply.link_id)];
                                break;

                            // Wiki
                            case 'wiki_created':
                            case 'wiki_deleted':
                                this.refreshUserStoriesAndWikis();
                                break;
                            case 'segment_added':
                                this.parser.addSegment(this.data.wikiNav[0],reply);
                                //this.refreshWikiHierarchy();
                                if (this.outgoing['segment' + reply.title]) {
                                    let callback: Function =
                                        this.outgoing['segment' + reply.title].callback;
                                    callback(reply);
                                    delete this.outgoing['segment' + reply.title];
                                }
                                
                                break;
                            case 'page_added':
                                this.parser.addPage(this.data.wikiNav[0],reply);
                                //this.refreshWikiHierarchy();
                                if (this.outgoing['page' + reply.title]) {
                                    let callback: Function =
                                        this.outgoing['page' + reply.title].callback;
                                    callback(reply);
                                    delete this.outgoing['page' + reply.title];
                                }
                                
                                break;
                            case 'alias_deleted':
                            case 'alias_updated':
                                this.refreshWikiHierarchy();
                                this.refreshStoryContent();
                                break;
                            case 'segment_deleted':
                            case 'page_deleted':
                                this.refreshWikiHierarchy();
                                break;
                            case 'subscribed_to_wiki':
                                this.subscribedToWiki = true;
                                this.refreshWikiInfo();
                                break;
                            case 'unsubscribed_from_wiki':
                                this.subscribedToWiki = false;
                                break;
                            case 'got_wiki_information':
                                reply.wiki_id = this.data.wiki.wiki_id;
                                this.data.wiki = reply;
                                this.data.wikiDisplay = this.parser.setWikiDisplay(reply);
                                this.refreshWikiHierarchy();
                                break;
                            case 'got_wiki_hierarchy':
                            case 'got_wiki_segment_hierarchy':
                                this.data.segment = reply.hierarchy;
                                let result = this.parser.parseWiki(
                                    reply.hierarchy, this.data.selectedEntry);
                                this.data.wikiNav = result[0];
                                this.data.statsPages = result[1];
                                this.data.linkTable = this.parser.parseLinkTable(
                                    reply.link_table);
                                break;
                            case 'got_wiki_segment':
                                this.data.page = JSON.parse(JSON.stringify(reply).replace(
                                    'template_headings', 'headings'));
                                if (this.outgoing["segment"+reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing["segment"+reply.identifier.message_id].callback;
                                    callback(reply);
                                    delete this.outgoing["segment"+reply.identifier.message_id];
                                }
                                break;
                            case 'got_wiki_page':
                                
                                this.data.page = this.parser.setPageDisplay(
                                    reply, this.data.linkTable);
                                this.data.tooltip.text = '<b>' + reply.title + '</b>';
                                if (reply.headings && reply.headings[0]) {
                                    this.data.tooltip.text += '<br/><u>' + reply.headings[0].title
                                        + '</u><br/>' + reply.headings[0].text;
                                }
                                 if (this.outgoing["page"+reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing["page"+reply.identifier.message_id].callback;
                                    callback(reply);
                                    delete this.outgoing["page"+reply.identifier.message_id];
                                }
                                break;

                            // Statistics
                            case 'got_page_frequencies':
                                this.data.statsPageFrequency = this.parser.parsePageFrequency(
                                    reply.pages, this.data.statsPages, this.data.statsSections);
                                break;
                            case 'got_story_statistics':
                            case 'got_section_statistics':
                            case 'got_paragraph_statistics':
                                this.data.stats.word_count = reply.statistics.word_count;
                                this.data.stats.word_frequency = this.parser.parseWordFrequency(
                                    reply.statistics.word_frequency);
                                break;
                            case 'got_page_frequencies':
                                this.data.statsPageFrequency = this.parser.parsePageFrequency(reply.pages,
                                    this.data.statsPages, this.data.statsSections);
                                break;
                            default:
                                break;
                        }
                        return reply.event;
                    }
                }
                return 'unknown';
            });
        this.messages.subscribe((action: string) => {
            console.log(action);
        });
    }

    // ----- USER ----- //
    public refreshUserPreferences() {
        this.send({ action: 'get_user_preferences' });
    }
    public refreshUserStoriesAndWikis() {
        this.send({ action: 'get_user_stories_and_wikis' });
    }

    // ----- STORY ----- //
    public refreshStoryInfo() {
        this.send({ action: 'get_story_information' });
    }
    public refreshStoryHierarchy() {
        this.send({ action: 'get_story_hierarchy' });
    }
    public refreshBookmarks() {
        this.send({ action: 'get_story_bookmarks' });
    }
    public refreshStoryContent(
        sectionID: ID = this.data.section.data.section_id,
        title: string = this.data.section.data.title,
        positionContext: any = this.data.story.position_context) {
        if (!title) {
            let sectionNode: TreeNode = this.findSection(this.data.storyNode[0], JSON.stringify(sectionID));
            if (sectionNode) {
                title = sectionNode.data.title;
            }
        }
        this.data.storyDisplay = '';
        this.send({ action: 'get_section_content', section_id: sectionID }, () => { },
            { sectionID: sectionID, title: title, positionContext: positionContext });
    }
    public findSection(start: TreeNode, sectionID: string): TreeNode {
        if (JSON.stringify(start.data.section_id) === sectionID) {
            return start;
        }
        for (let section of start.children) {
            let found = this.findSection(section, sectionID);
            if (found) {
                return found;
            }
        }
        return null;
    }

    // ----- WIKI ----- //
    public refreshWikiInfo(callback: Function = () => { }) {
        this.send({ action: 'get_wiki_information' },callback);
    }
    public refreshWikiHierarchy() {
        this.send({ action: 'get_wiki_hierarchy' });
    }

    /**
     * Send a message on the websocket
     * @param message
     * @param callback
     * @param metadata
     */
    public send(message: any, callback: Function = () => { }, metadata: any = {}) {
        message.identifier = { message_id: ++this.message_id };

        // Keep track of outgoing messages
        let key: string = '';
        if (message.action === 'add_page' ) {
            key = 'page' + message.title;

        } else if(message.action === 'get_wiki_page'){
             key = 'page' + message.identifier.message_id;
        }else if (message.action === 'add_segment') {
            key = 'segment' + message.title;
        } else if (message.action === 'get_wiki_segment')
        {
            key = 'segment' + message.identifier.message_id;
        }
        else {
            key = message.identifier.message_id;
        }

        this.outgoing[key] = {
            callback: callback,
            metadata: metadata
        };
        if (!metadata.noflight) {
            this.data.inflight = true;
        }

        // Send or queue the message
        if (this.uuid) {
            message.identifier.uuid = this.uuid;
            console.log(message);
            this.messages.next(message);
        } else {
            this.queued.push(message);
        }
    }
}
