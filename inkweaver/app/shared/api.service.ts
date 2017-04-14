﻿import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { MenuItem, TreeNode, SelectItem } from 'primeng/primeng';

import { WebSocketService } from './websocket.service';
import { ParserService } from './parser.service';

// Models
import { User } from '../models/user/user.model';
import { Collaborator } from '../models/user/collaborator.model';
import { LinkTable } from '../models/link/link-table.model';
import { AliasTable } from '../models/link/alias-table.model';
import { Alias } from '../models/link/alias.model';
import { PassiveLinkTable } from '../models/link/passive-link-table.model';
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

@Injectable()
export class ApiService {
    public data: any;

    public uuid: string;
    public local: boolean = true;
    public subscribedToWiki: boolean = false;
    public subscribedToStory: boolean = false;

    public queued: any[] = [];
    public outgoing: Object = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(
        private socket: WebSocketService,
        private parser: ParserService) { this.resetData(); }

    public connect() {
        let url: string = this.local ? 'ws://localhost:8080/ws' : 'wss://inkweaver.plotypus.net:8080/ws';

        this.messages = <Subject<string>>this.socket.connect(url)
            .map((res: MessageEvent) => {
                this.data.loading = false;
                let response: string = res.data;
                let reply = JSON.parse(response);

                if (reply) {
                    // Extract the fields from the original message
                    let index: number = 0;
                    let metadata: any = {};
                    let myMessage: boolean = false;
                    let callback: Function = () => { };
                    let identifier: any = reply.identifier;
                    if (identifier) {
                        myMessage = identifier.uuid == this.uuid;
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

                            // ----- User ----- //
                            case 'got_user_preferences':
                                this.data.user = reply;
                                break;
                            case 'got_user_stories_and_wikis':
                                this.data.stories = reply.stories;
                                this.data.stories.unshift({
                                    story_id: null, title: null,
                                    access_level: null, position_context: null, wiki_summary: null
                                });
                                this.data.wikis = reply.wikis;
                                this.data.wikis.unshift({
                                    wiki_id: null, title: null,
                                    access_level: null
                                });
                                break;
                            case 'user_name_updated':
                                break;
                            case 'user_email_updated':
                                break;
                            case 'user_bio_updated':
                                break;
                            case 'collaborator_added':
                                this.data.collaborators.unshift({ label: reply.name, value: reply.user_id });
                                break;
                            case 'collaborator_removed':
                                let index: number = this.data.collaborators.findIndex((collaborator) => {
                                    return reply.user_id === collaborator.value;
                                });
                                this.data.collaborators.splice(index, 1);
                                break;

                            // ----- Story ----- //
                            case 'story_created':
                                reply.title = reply.story_title;
                                reply.wiki_summary = this.data.newWiki;
                                this.data.stories.push(reply);
                                break;
                            case 'story_updated':
                                this.data.story.story_title = reply.update.title;
                                this.data.storyNode[0].data.title = reply.update.title;
                                let updateIdx: number = this.data.stories.findIndex((story: StorySummary) => {
                                    return JSON.stringify(story.story_id) !== JSON.stringify(reply.story_id)
                                });
                                this.data.stories[updateIdx].title = reply.update.title;
                                break;
                            case 'story_deleted':
                                let delIdx: number = this.data.stories.findIndex((story: StorySummary) => {
                                    return JSON.stringify(story.story_id) !== JSON.stringify(reply.story_id)
                                });
                                this.data.stories.splice(delIdx, 1);
                                // TODO: navigate user back to user page if he/she is currently in the deleted story
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

                                this.data.collaborators = [{ label: null, value: null }];
                                for (let user of reply.users) {
                                    this.data.collaborators.unshift({
                                        label: user.name, value: user.user_id
                                    });
                                }
                                break;
                            case 'got_story_hierarchy':
                            case 'got_section_hierarchy':
                                // Set the navigation panel
                                this.data.storyNode = [this.parser.sectionToTree(this.parser, reply.hierarchy, null)];

                                // Set the current section
                                if (this.data.story.position_context && this.data.story.position_context.section_id) {
                                    this.data.section.data = {
                                        section_id: this.data.story.position_context.section_id
                                    };
                                } else if (!this.data.section.data) {
                                    this.data.section = this.data.storyNode[0];
                                }
                                this.data.section = this.parser.setSection(
                                    this.data.storyNode[0], JSON.stringify(this.data.section.data.section_id));
                                this.data.prevSection = this.data.section;

                                // Set the stats section
                                this.data.statsSections = this.parser.flattenTree(this.data.storyNode[0]);
                                if (!this.data.storyDisplay) {
                                    this.refreshStoryContent();
                                }
                                break;
                            case 'got_section_content':
                                // Set the content object
                                if (this.outgoing["section" + reply.identifier.message_id]) {
                                    metadata = this.outgoing["section" + reply.identifier.message_id].metadata;
                                }
                                this.data.contentObject = this.parser.parseContent(reply.content, this.data.aliasTable, this.data.linkTable, this.data.passiveLinkTable);
                                if (!metadata.pdf) {
                                    // Set the story display
                                    this.data.storyDisplay = this.parser.setContentDisplay(reply.content);

                                    // Set the section in the navigation panel
                                    this.data.section = this.parser.setSection(
                                        this.data.storyNode[0], JSON.stringify(metadata.section_id));

                                    // If this is the top-level section, put a summary tag
                                    if (JSON.stringify(metadata.section_id) === JSON.stringify(this.data.story.section_id)) {
                                        if (!this.data.storyDisplay) {
                                            this.data.storyDisplay = '<p><em>Write a summary here!</em></p>';
                                        }
                                        this.data.storyDisplay = '<h1>Summary</h1>' + this.data.storyDisplay;
                                    } else {
                                        this.data.storyDisplay = '<h1>' + metadata.title + '</h1>' + this.data.storyDisplay;
                                    }
                                }
                                else
                                {
                                    if (this.outgoing["section" + reply.identifier.message_id]) {
                                        let callback: Function =
                                            this.outgoing["section" + reply.identifier.message_id].callback;
                                        callback(reply);
                                        delete this.outgoing["section" + reply.identifier.message_id];
                                    }
                                }
                                break;

                            // Section
                            case 'preceding_subsection_added':
                                break;
                            case 'inner_subsection_added':
                                this.parser.findSection(this.data.storyNode[0], JSON.stringify(reply.parent_id), (found: TreeNode) => {
                                    let newSection: TreeNode = {
                                        parent: found, data: { title: reply.title, section_id: reply.section_id }, children: []
                                    }
                                    reply.index = reply.index ? reply.index : found.children.length;
                                    found.children.splice(reply.index, 0, newSection);
                                });
                                break;
                            case 'succeeding_subsection_added':
                                break;
                            case 'section_title_updated':
                                this.parser.findSection(this.data.storyNode[0], JSON.stringify(reply.section_id), (found: TreeNode) => {
                                    let old: string = found.data.title;
                                    found.data.title = reply.new_title;
                                    if (this.data.section.data && JSON.stringify(this.data.section.data.section_id) === JSON.stringify(found.data.section_id)) {
                                        this.data.storyDisplay = this.data.storyDisplay.replace('<h1>' + old + '</h1>',
                                            '<h1>' + reply.new_title + '</h1>');
                                    }
                                });
                                break;
                            case 'section_deleted':
                                this.parser.findSection(this.data.storyNode[0], JSON.stringify(reply.section_id), (found: TreeNode) => {
                                    let index: number = found.parent.children.indexOf(found);
                                    found.parent.children.splice(index, 1);
                                });
                                break;
                            case 'subsection_moved_as_preceding':
                                break;
                            case 'subsection_moved_as_inner':
                                let moved: TreeNode = this.parser.findSection(
                                    this.data.storyNode[0], JSON.stringify(reply.section_id), (found: TreeNode) => {
                                        let index: number = found.parent.children.indexOf(found);
                                        found.parent.children.splice(index, 1);
                                    });
                                this.parser.findSection(this.data.storyNode[0], JSON.stringify(reply.to_parent_id), (found: TreeNode) => {
                                    moved.parent = found;
                                    found.children.splice(reply.to_index, 0, moved);
                                });
                                break;
                            case 'subsection_moved_as_succeeding':
                                break;

                            // Paragraph
                            case 'paragraph_added':
                                if (!myMessage && this.data.storyDisplay && this.data.section.data && JSON.stringify(reply.section_id) == JSON.stringify(this.data.section.data.section_id)) {
                                    // Add paragraph to content object
                                    let p: Paragraph = {
                                        paragraph_id: reply.paragraph_id, text: reply.text,
                                        note: null, succeeding_id: reply.succeeding_paragraph_id,
                                        links: new AliasTable(), passiveLinks: new AliasTable()
                                    };
                                    this.parser.parseParagraph(p, this.data.aliasTable, this.data.linkTable, this.data.passiveLinkTable);
                                    this.data.contentObject[JSON.stringify(p.paragraph_id)] = p;

                                    let pString: string = this.parser.setParagraph(p);
                                    if (!p.succeeding_id) {
                                        // Set previous paragraph's succeeding_id
                                        let searchIndex: number = this.data.storyDisplay.lastIndexOf('<p id="');
                                        if (searchIndex > -1) {
                                            let searchString: string = this.data.storyDisplay.substring(searchIndex);
                                            let search: RegExpMatchArray = searchString.match(/<p id="([a-z0-9]{24})">/);
                                            if (search && search.length > 1) {
                                                this.data.contentObject[JSON.stringify({ $oid: search[1] })].succeeding_id = p.paragraph_id;
                                            }
                                        }
                                        // Add paragraph to display string
                                        this.data.storyDisplay += pString;
                                    } else {
                                        // Set previous paragraph's succeeding_id
                                        let pRegex: RegExp = new RegExp('(<p id="([a-z0-9]{24})">.*?</p>)?(<p id="' + reply.succeeding_id.$oid + '">.*?</p>)');
                                        let search: RegExpMatchArray = this.data.storyDisplay.match(pRegex);
                                        if (search && search.length > 3) {
                                            this.data.contentObject[JSON.stringify({ $oid: search[2] })].succeeding_id = p.paragraph_id;
                                        }
                                        // Add paragraph to display string
                                        this.data.storyDisplay = this.data.storyDisplay.replace(
                                            new RegExp('<p id="' + reply.succeeding_id.$oid + '">.*?</p>'),
                                            pString + '$&');
                                    }
                                }
                                break;
                            case 'paragraph_updated':
                                if (this.data.storyDisplay && this.data.section.data && JSON.stringify(reply.section_id) == JSON.stringify(this.data.section.data.section_id)) {
                                    // Update the content object
                                    let p: Paragraph = this.data.contentObject[JSON.stringify(reply.paragraph_id)];
                                    p.text = reply.update.text;
                                    this.parser.parseParagraph(p, this.data.aliasTable, this.data.linkTable, this.data.passiveLinkTable);
                                    this.data.contentObject[JSON.stringify(p.paragraph_id)] = p;
                                    // Update paragraph in display string
                                    let pString: string = this.parser.setParagraph(p);
                                    this.data.storyDisplay = this.data.storyDisplay.replace(
                                        new RegExp('<p id="' + reply.paragraph_id.$oid + '">.*?</p>'), pString);
                                }
                                break;
                            case 'paragraph_deleted':
                                if (!myMessage && this.data.storyDisplay && this.data.section.data && JSON.stringify(reply.section_id) == JSON.stringify(this.data.section.data.section_id)) {
                                    delete this.data.contentObject[JSON.stringify(reply.paragraph_id)];
                                    // Set previous paragraph's succeeding_id to the next id
                                    let prior: RegExp = new RegExp('(<p id="([a-z0-9]{24})">.*?</p>)?<p id="' + reply.paragraph_id.$oid + '">.*?</p>');
                                    let priorMatch: RegExpMatchArray = this.data.storyDisplay.match(prior);
                                    if (priorMatch && priorMatch.length > 2) {
                                        let posteriorID: ID = null;
                                        let posterior: RegExp = new RegExp('<p id="' + reply.paragraph_id.$oid + '">.*?</p>(<p id="([a-z0-9]{24})" >.*?</p>)?');
                                        let posteriorMatch: RegExpMatchArray = this.data.storyDisplay.match(posterior);
                                        if (posteriorMatch && posteriorMatch.length > 2) {
                                            posteriorID = { $oid: posteriorMatch[2] };
                                        }
                                        this.data.contentObject[JSON.stringify({ $oid: priorMatch[2] })].succeeding_id = posteriorID;
                                    }
                                    // Add paragraph to display string
                                    this.data.storyDisplay = this.data.storyDisplay.replace(
                                        new RegExp('<p id="' + reply.paragraph_id.$oid + '">.*?</p>'), '');
                                }
                                break;

                            // Bookmarks and Notes
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
                            case 'note_updated':
                                if (!myMessage && this.data.storyDisplay && this.data.section.data && JSON.stringify(reply.section_id) == JSON.stringify(this.data.section.data.section_id)) {
                                    // Update content object
                                    this.data.contentObject[JSON.stringify(reply.paragraph_id)].note = reply.note;
                                    // Update story display
                                    this.data.storyDisplay = this.data.storyDisplay.replace(
                                        new RegExp('<p id="' + reply.paragraph_id.$oid + '">(<code>.*?</code>)?(.*?)</p>'),
                                        '<p id="' + reply.paragraph_id.$oid + '"><code>' + reply.note + '</code>$2</p>');
                                }
                                break;
                            case 'note_deleted':
                                if (!myMessage && this.data.storyDisplay && this.data.section.data && JSON.stringify(reply.section_id) == JSON.stringify(this.data.section.data.section_id)) {
                                    // Update content object
                                    this.data.contentObject[JSON.stringify(reply.paragraph_id)].note = null;
                                    // Update story display
                                    this.data.storyDisplay = this.data.storyDisplay.replace(
                                        new RegExp('<p id="' + reply.paragraph_id.$oid + '"><code>.*?</code>(.*?)</p>'),
                                        '<p id="' + reply.paragraph_id.$oid + '">$1</p>');
                                }
                                break;

                            // Links
                            case 'alias_created':
                                this.data.aliasTable[JSON.stringify(reply.alias_id)] = {
                                    page_id: reply.page_id, alias_name: reply.alias_name
                                };
                                break;
                            case 'alias_updated':
                                let alias = this.data.aliasTable[JSON.stringify(reply.alias_id)];
                                if (alias) {
                                    alias.alias_name = reply.new_name;
                                }
                                break;
                            case 'alias_deleted':
                                delete this.data.aliasTable[JSON.stringify(reply.alias_id)];
                                break;
                            case 'link_created':
                                this.data.linkTable[JSON.stringify(reply.link_id)] = reply.alias_id;
                                break;
                            case 'link_deleted':
                                delete this.data.linkTable[JSON.stringify(reply.link_id)];
                                break;
                            case 'passive_link_created':
                                this.data.passiveLinkTable[JSON.stringify(reply.passive_link_id)] = {
                                    alias_id: reply.alias_id, pending: true
                                };
                                break;
                            case 'passive_link_deleted':
                                delete this.data.passiveLinkTable[JSON.stringify(reply.passive_link_id)];
                                break;
                            case 'passive_link_rejected':
                                this.data.passiveLinkTable[JSON.stringify(reply.passive_link_id)].pending = false;
                                this.data.storyDisplay = this.data.storyDisplay.replace(
                                    new RegExp('<a href="(' + reply.passive_link_id.$oid + ')-([a-f0-9]{24})-true" target="_blank" id="true">(.*?)</a>'),
                                    '<a href="$1-$2-false" target="_blank" id="false">$3</a>');
                                break;

                            // Wiki
                            case 'wiki_created':
                                reply.title = reply.wiki_title;
                                this.data.newWiki = reply;
                                break;
                            case 'wiki_deleted':
                                break;
                            case 'wiki_updated':
                                let wiki = this.data.selectedEntry as TreeNode;
                                wiki.label = reply.update.title;
                                wiki.data.title = reply.update.title;
                                break;
                            case 'segment_added':
                                this.parser.addSegment(this.data.wikiNav[0], reply);
                                this.data.selectedEntry = this.parser.findSegment(this.data.wikiNav[0], reply.segment_id);
                                if (this.outgoing['segment' + reply.title]) {
                                    let callback: Function =
                                        this.outgoing['segment' + reply.title].callback;
                                    callback(reply);
                                    delete this.outgoing['segment' + reply.title];
                                }

                                break;
                            case 'page_added':
                                this.parser.addPage(this.data.wikiNav[0], reply);
                                this.data.selectedEntry = this.parser.findPage(this.data.wikiNav[0], reply.page_id);
                                if (this.outgoing['page' + reply.title]) {
                                    let callback: Function =
                                        this.outgoing['page' + reply.title].callback;
                                    callback(reply);
                                    delete this.outgoing['page' + reply.title];
                                }

                                break;
                            case 'segment_deleted':
                                this.parser.deleteSegment(this.data.wikiNav[0], reply.segment_id);
                                if (this.outgoing['segment' + reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing['segment' + reply.identifier.message_id].callback;
                                    callback(reply);
                                    delete this.outgoing['segment' + reply.identifier.message_id];
                                }
                                break;
                            case 'page_deleted':
                                this.parser.deletePage(this.data.wikiNav[0], reply.page_id);
                                if (this.outgoing['page' + reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing['page' + reply.identifier.message_id].callback;
                                    callback(reply);
                                    delete this.outgoing['page' + reply.identifier.message_id];
                                }
                                break;
                            case 'segment_updated':
                                let seg = this.data.selectedEntry as TreeNode;
                                if (JSON.stringify(reply.segment_id) === JSON.stringify(seg.data.id)) {
                                    this.data.page.title = reply.update['title'];
                                    seg.label = reply.update['title'];
                                    seg.data.title = reply.update['title'];
                                }
                                else {
                                    seg = this.parser.findSegment(this.data.wikiNav[0], reply.segment_id);
                                    seg.label = reply.update['title'];
                                    seg.data.title = reply.update['title'];
                                }
                                break;
                            case 'page_updated':
                                let page = this.data.selectedEntry as TreeNode;
                                if (JSON.stringify(reply.page_id) === JSON.stringify(page.data.id)) {
                                    this.data.page.title = reply.update['title'];
                                    page.label = reply.update['title'];
                                    page.data.title = reply.update['title'];
                                }
                                else {
                                    page = this.parser.findSegment(this.data.wikiNav[0], reply.page_id);
                                    page.label = reply.update['title'];
                                    page.data.title = reply.update['title'];
                                }
                                break;
                            case 'got_wiki_segment':
                                this.data.page = JSON.parse(JSON.stringify(reply).replace(
                                    'template_headings', 'headings'));
                                if (this.outgoing["segment" + reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing["segment" + reply.identifier.message_id].callback;
                                    callback(reply);
                                    delete this.outgoing["segment" + reply.identifier.message_id];
                                }
                                break;
                            case 'got_wiki_page':
                                this.data.page = this.parser.setPageDisplay(
                                    reply, this.data.linkTable, this.data.aliasTable);
                                this.data.tooltip.text = '<b>' + reply.title + '</b>';
                                if (reply.headings && reply.headings[0]) {
                                    this.data.tooltip.text += '<br/><u>' + reply.headings[0].title
                                        + '</u><br/>' + reply.headings[0].text;
                                }
                                if (this.outgoing["page" + reply.identifier.message_id]) {
                                    let callback: Function =
                                        this.outgoing["page" + reply.identifier.message_id].callback;
                                    callback(reply);

                                    if (this.outgoing["page" + reply.identifier.message_id].metadata &&
                                        this.outgoing["page" + reply.identifier.message_id].metadata.hasOwnProperty("page_id")) {
                                        this.data.selectedEntry = this.parser.findPage(this.data.wikiNav[0],
                                            this.outgoing["page" + reply.identifier.message_id].metadata.page_id);
                                        this.parser.expandPath(this.data.selectedEntry);
                                    }
                                    delete this.outgoing["page" + reply.identifier.message_id];
                                }
                                break;
                            case 'move_segment':
                                if (!myMessage) {
                                    let sid = reply.segment_id;
                                    let to_pid = reply.to_parent_id;
                                    let to_idx = reply.to_index;

                                    let curr_node = this.parser.findSegment(this.data.wikiNav[0], sid);
                                    let parent_node = this.parser.findSegment(this.data.wikiNav[0], to_pid);
                                   // console.log("Moving: " + curr_node.label + " into " + parent_node.label + "at index " + to_idx);

                                    //remove from current location
                                    let idx = curr_node.parent.children.indexOf(curr_node);
                                    curr_node.parent.children.splice(idx, 1);

                                    parent_node.children.splice(to_idx, 0, curr_node);
                                    curr_node.parent = parent_node;
                                }
                             
                                break;
                            case 'page_moved':
                                if (!myMessage) {
                                    let pid = reply.page_id;
                                    let to_pid = reply.to_parent_id;
                                    let to_idx = reply.to_index;

                                    let curr_node = this.parser.findPage(this.data.wikiNav[0], pid);
                                    let parent_node = this.parser.findPage(this.data.wikiNav[0], to_pid);
                                    //console.log("Moving: " + curr_node.label + " into " + parent_node.label + "at index " + to_idx);

                                    //remove from current location
                                    let idx = curr_node.parent.children.indexOf(curr_node);
                                    curr_node.parent.children.splice(idx, 1);

                                    parent_node.children.splice(to_idx, 0, curr_node);
                                    curr_node.parent = parent_node;
                                }
                            
                                break;
                            case 'template_heading_added':
                            case 'template_heading_updated':
                            case 'template_heading_deleted':
                                let t_head = this.data.selectedEntry as TreeNode;
                                if (!myMessage && JSON.stringify(reply.segment_id) === JSON.stringify(t_head.data.id)) {
                                    let callback: Function = this.data.wikiFuctions[0];
                                    callback(reply);
                                }
                                break;
                            case 'heading_added':
                            case 'heading_updated':
                            case 'heading_deleted':
                                let head = this.data.selectedEntry as TreeNode;
                                if (!myMessage && JSON.stringify(reply.page_id) === JSON.stringify(head.data.id)) {
                                    let callback: Function = this.data.wikiFuctions[0];
                                    callback(reply);
                                }
                                break;

                            case 'subscribed_to_wiki':
                                this.subscribedToWiki = true;
                                this.refreshWikiInfo();
                                this.refreshWikiHierarchy();
                                this.refreshLinkAliasTable();
                                break;
                            case 'unsubscribed_from_wiki':
                                this.subscribedToWiki = false;
                                break;
                            case 'got_wiki_information':
                                reply.wiki_id = this.data.wiki.wiki_id;
                                this.data.wiki = reply;
                                this.data.wikiDisplay = this.parser.setWikiDisplay(reply);
                                break;
                            case 'got_wiki_hierarchy':
                            case 'got_wiki_segment_hierarchy':
                                this.data.segment = reply.hierarchy;
                                let result = this.parser.parseWiki(
                                    reply.hierarchy, this.data.selectedEntry);
                                this.data.wikiNav = result[0];
                                this.data.statsPages = result[1];
                                if (this.data.storyFunction) {
                                    let callback: Function = this.data.storyFunction;
                                    callback(reply);
                                }

                                break;

                            case 'got_wiki_alias_list':
                                let temp = this.parser.parseLinkTable(reply.alias_list);
                                this.data.linkTable = temp[0];
                                this.data.aliasTable = temp[1];
                                this.data.passiveLinkTable = temp[2];
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

    // ----- STORY ----- //
    public refreshStoryInfo() {
        this.send({ action: 'get_story_information' }, () => { }, { load: true });
    }
    public refreshStoryHierarchy() {
        this.send({ action: 'get_story_hierarchy' }, () => { }, { load: true });
    }
    public refreshBookmarks() {
        this.send({ action: 'get_story_bookmarks' }, () => { }, { load: true });
    }
    public refreshStoryContent(
        sectionID: ID = this.data.section.data.section_id, title: string = this.data.section.data.title) {
        if (!title) {
            let sectionNode: TreeNode = this.parser.findSection(this.data.storyNode[0], JSON.stringify(sectionID));
            if (sectionNode) {
                title = sectionNode.data.title;
            }
        }
        this.data.storyDisplay = '';
        this.send({ action: 'get_section_content', section_id: sectionID }, () => { },
            { load: true, title: title, section_id: sectionID });
    }

    // ----- WIKI ----- //
    public refreshWikiInfo() {
        this.send({ action: 'get_wiki_information' }, () => { }, { load: true });
    }
    public refreshWikiHierarchy() {
        this.send({ action: 'get_wiki_hierarchy' }, () => { }, { load: true });
    }
    public refreshLinkAliasTable() {
        this.send({ action: 'get_wiki_alias_list' }, () => { }, { load: true });
    }

    // Reset the data object
    public resetData() {
        this.data = {
            loading: false,
            tooltip: new Tooltip(),
            collaborators: new Array<SelectItem>(),

            user: new User(),
            stories: new Array<StorySummary>(),
            wikis: new Array<WikiSummary>(),
            newWiki: new WikiSummary(),
            linkTable: new LinkTable(),
            aliasTable: new AliasTable(),
            passiveLinkTable: new PassiveLinkTable(),

            storyDisplay: '',
            story: new Story(),
            prevSection: new Section(),
            section: new Section(),
            storyNode: new Array<TreeNode>(),
            contentObject: new ContentObject(),
            bookmarks: new Array<TreeNode>(),

            statSection: new Section(),
            statSegments: [],
            stats: new Stats(),
            statsPages: {},
            statsSections: {},
            statsPageFrequency: {},

            wikiNav: [],
            wikiDisplay: '',
            wiki: new Wiki(),
            segment: new Segment(),
            page: new Page(),
            wikiFuctions: new Array<Function>(),
            storyFunction: new Function(),
            selectedEntry: {},
        };
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
        if (message.action === 'add_page') {
            key = 'page' + message.title;
        } else if (message.action === 'get_wiki_page') {
            key = 'page' + message.identifier.message_id;
        } else if (message.action === 'add_segment') {
            key = 'segment' + message.title;
        } else if (message.action === 'get_wiki_segment') {
            key = 'segment' + message.identifier.message_id;
        } else if (message.action === 'delete_segment') {
            key = 'segment' + message.identifier.message_id;
        } else if (message.action === 'delete_page') {
            key = 'page' + message.identifier.message_id;
        } else if (message.action === 'get_section_content') {
            key = 'section' + message.identifier.message_id;
        }
        else {
            key = message.identifier.message_id;
        }

        this.outgoing[key] = {
            callback: callback,
            metadata: metadata
        };
        if (metadata.load) {
            this.data.loading = true;
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
