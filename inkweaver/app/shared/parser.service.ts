import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { WebSocketService } from './websocket.service';

// Story
import { User } from '../models/user.model';
import { StorySummary } from '../models/story-summary.model';
import { Story } from '../models/story.model';
import { ChapterSummary } from '../models/chapter-summary.model';
import { Chapter } from '../models/chapter.model';
import { Paragraph } from '../models/paragraph.model';

// Wiki
import { WikiSummary } from '../models/wiki-summary.model';
import { Wiki } from '../models/wiki.model';
import { PageSummary } from '../models/page-summary.model';
import { Page } from '../models/page.model';
import { Section } from '../models/section.model';

const url: string = 'ws://localhost:8080/ws/v2/test';

@Injectable()
export class ParserService {
    public data = {
        'name': '',
        'display': '',
        'wikiDisplay': '',
        'inflight': false,

        'storySelected': false,
        'story': new Story(),
        'chapterSummary': new ChapterSummary(),
        'chapter': new Chapter(),
        'paragraph': new Paragraph(),

        'wikiSelected': false,
        'wiki': new Wiki(),
        'pageSummary': new PageSummary(),
        'page': new Page(),
        'segment': new Wiki()
    }

    public outgoing = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(socket: WebSocketService) {
        this.messages = <Subject<string>>socket
            .connect(url).map((response: MessageEvent): string => response.data);
    }

    public receive(): Observable<string> {
        return this.messages.map((response: string) => {
            this.data.inflight = false;

            let reply = JSON.parse(response);
            let message_id: number = reply.reply_to;
            let action: string = this.outgoing[message_id];

            switch (action) {
                //message for editor
                case 'get_user_info':
                    this.data.name = reply.name;
                    this.send({ 'action': 'load_story_with_chapters', 'story': reply.stories[0].id });
                    break;

                case 'load_story_with_chapters':
                case 'load_story':
                    this.data.story = reply;

                    this.setStoryDisplay();
                    this.send({ 'action': 'get_wiki_hierarchy', 'wiki': reply.wiki });
                    break;

                case 'get_all_chapters':
                    this.data.story.chapters = reply;
                    break;

                case 'load_chapter_with_paragraphs':
                    this.data.paragraph = reply.paragraphs[0];
                case 'load_chapter':
                    this.data.chapter = reply;

                    this.setChapterDisplay();
                    break;

                case 'get_all_paragraphs':
                    this.data.paragraph = reply[0];
                    this.data.chapter.paragraphs = reply;

                    this.setChapterDisplay();
                    break;

                case 'load_paragraph':
                    this.data.paragraph = reply;
                    this.data.display = reply.text;
                    break;

                // Messages for the wiki
                case 'get_wiki_hierarchy':
                    this.data.wikiSelected = true;
                    this.data.wiki = reply.hierarchy;

                    this.setWikiDisplay();
                    break;
                case 'load_wiki_page_with_sections':
                    this.data.wikiSelected = false;
                    this.data.page = reply.wiki_page;
                    this.data.pageSummary.id = reply.wiki_page.id;
                    this.data.segment = this.getSegment(reply.wiki_page);

                    this.setPageDisplay();
                    break;

                default:
                    console.log('Unknown action: ' + action)
                    break;
            }
            delete this.outgoing[message_id];
            return action;
        });
    }

    /**
     * Set the display for the story
     */
    public setStoryDisplay() {
        this.data.storySelected = true;
        this.data.chapterSummary = new ChapterSummary();

        this.data.display =
            '<h1>Title</h1><h2>' + this.data.story.title + '</h2><br>' +
            '<h1>Owner</h1><h2>' + this.data.story.owner + '</h2><br>' +
            '<h1>Synopsis</h1><h2>' + this.data.story.synopsis + '</h2><br>' +
            '<h1>Chapters</h1>';
        for (let chapter of this.data.story.chapters) {
            this.data.display += '<h2>' + chapter.title + '</h2>';
        }
        this.data.display += '<br>';
    }

    public setChapterDisplay() {
        let paragraphs = this.data.chapter.paragraphs;
        this.data.display = '';
        for (let i = 0; i < paragraphs.length; i++) {
            this.data.display += '<p><code>' + paragraphs[i].id + '</code>' + paragraphs[i].text + '</p>';
        }
    }

    /**
     * Set the display for the wiki
     */
    public setWikiDisplay() {
        this.data.wikiSelected = true;
        this.data.page = new Page();
        this.data.segment = new Wiki();
        this.data.pageSummary = new PageSummary();

        this.data.wikiDisplay =
            '<h1>Title</h1><h2>' + this.data.wiki.title + '</h2><br>' +
            '<h1>Segments</h1>';
        for (let segment of this.data.wiki.segments) {
            this.data.wikiDisplay += '<h2>' + segment.title + '</h2>';
        }
        this.data.wikiDisplay += '<br>';
    }


    /**
     * Set the wiki diplay to a specific page
     */
    public setPageDisplay() {
        let page = this.data.page;

        this.data.wikiDisplay =
            '<h1>Name</h1><h2>' + page.title + '</h2><br>' +
            '<h1>Aliases</h1>';
        for (let alias of page.aliases) {
            this.data.wikiDisplay += '<h2>' + alias + '</h2>';
        }
        this.data.wikiDisplay += '<br>';
        for (let section of page.sections) {
            this.data.wikiDisplay += '<h1>' + section.title + '</h1>';
            for (let paragraph of section.paragraphs) {
                this.data.wikiDisplay += '<h2>' + paragraph.text + '</h2>';
            }
            this.data.wikiDisplay += '<br>';
        }
        this.data.wikiDisplay += '<h1>References</h1>';
        for (let reference of page.references) {
            this.data.wikiDisplay += '<h2>' + reference + '</h2>';
        }
        this.data.wikiDisplay += '<br>';
    }

    /**
     * Find the segment that contains the specified wiki page
     * @param {Page} page - The wiki page of which to find the segment
     */
    public getSegment(page: any): Wiki {
        for (let segment of this.data.wiki.segments) {
            for (let currentPage of segment.pages) {
                if (page.id.$oid === currentPage.id.$oid) {
                    return segment;
                }
            }
        }
        return new Wiki();
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