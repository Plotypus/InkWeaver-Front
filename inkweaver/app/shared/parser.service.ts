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
        'inflight': false,

        'storySelected': false,
        'story': new Story(),
        'selectedChapter': new ChapterSummary,
        'chapter': new Chapter(),
        'paragraph': new Paragraph(),

        'wikiSelected': false,
        'wiki': new Wiki(),
        'selectedPage': new Page(),
        'selectedSegment': new Wiki()
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
                    let chapter: ChapterSummary = reply.chapters[0];
                case 'load_story':
                    this.data.story = reply;
                    this.data.wikiSelected = true;
                    this.data.storySelected = true;
                    this.send({ 'action': 'get_wiki_hierarchy', 'wiki': reply.wiki });
                    break;

                case 'get_all_chapters':
                    this.data.story.chapters = reply;
                    this.send({ 'action': 'load_chapter_with_paragraphs', 'chapter': reply[0].id });
                    break;

                case 'load_chapter_with_paragraphs':
                    this.data.paragraph = reply.paragraphs[0];
                //for (let i = 0; i < reply.paragraphs.length; i++) {
                //    this.data.display += '<p>' + reply.paragraphs[i].text + '</p>';
                //}
                case 'load_chapter':
                    this.data.chapter = reply;
                    break;

                case 'get_all_paragraphs':
                    this.data.paragraph = reply[0];
                    this.data.chapter.paragraphs = reply;
                    //for (let i = 0; i < reply.paragraphs.length; i++) {
                    //    this.data.display += '<p>' + reply.paragraphs[i].text + '</p>';
                    //}
                    break;

                case 'load_paragraph':
                    this.data.paragraph = reply;
                    // this.data.display = reply.text;
                    break;

                // Messages for the wiki
                case 'get_wiki_hierarchy':
                    this.data.wiki = reply.hierarchy;
                    break;
                case 'load_wiki_page_with_sections':
                    this.data.wikiSelected = false;
                    this.data.selectedPage = reply.wiki_page;
                    this.data.selectedSegment = this.getSegment(reply.wiki_page);
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
     * Find the segment that contains the specified wiki page
     * @param {Page} page - The wiki page of which to find the segment
     */
    public getSegment(page: any): Wiki {
        for (let segment of this.data.wiki.segments) {
            for (let pageCheck of segment.pages) {
                if (page.id == pageCheck.id) return segment;
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