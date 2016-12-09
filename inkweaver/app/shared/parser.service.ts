import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

import { Story } from '../models/story.model';
import { ChapterSummary } from '../models/chapter-summary.model';
import { Chapter } from '../models/chapter.model';
import { Paragraph } from '../models/paragraph.model';
import { WebSocketService } from './websocket.service';
import { WikiSummary } from '../models/wiki-summary.model';

const url: string = 'ws://localhost:8080/ws/v2/test';

@Injectable()
export class ParserService {
    public paragraph: Paragraph = { 'id': '', 'text': '', 'statistics': '' };
    public chapter: Chapter = { 'id': '', 'title': '', 'statistics': '', 'paragraphs': [this.paragraph] };
    public selectedChapter: ChapterSummary = { 'id': '', 'title': '' };
    public story: Story = { 'id': '', 'title': '', 'owner': '', 'coauthors': [], 'statistics': '', 'settings': '', 'synopsis': '', 'wiki': { 'id': '', 'title': '' }, 'chapters': [this.chapter] };
    public selectedPage: WikiSummary = { 'id': '', 'title': '' };
    public wiki = {};
    public data = {
        'name': '',
        'display': '',
        'story': this.story,
        'storySelected': false,
        'selectedChapter': this.selectedChapter,
        'chapter': this.chapter,
        'paragraph': this.paragraph,
        'selectedPage': this.selectedPage,
        'wiki': this.wiki
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
            let reply = JSON.parse(response);
            let message_id: number = reply.reply_to;
            let action: string = this.outgoing[message_id];

            switch (action) {
                case 'get_user_info':
                    this.data.name = reply.name;
                    this.send({ 'action': 'load_story_with_chapters', 'story': reply.stories[0].id });
                    break;

                case 'load_story_with_chapters':
                    let chapter: ChapterSummary = reply.chapters[0];
                case 'load_story':
                    this.data.story = reply;
                    this.data.storySelected = true;
                    this.setStoryDisplay();
                    this.send({ 'action': 'get_wiki_hierarchy', 'wiki': this.data.story.wiki });
                    break;

                case 'get_all_chapters':
                    this.data.story.chapters = reply;
                    this.send({ 'action': 'load_chapter_with_paragraphs', 'chapter': reply[0].id });
                    break;

                case 'load_chapter_with_paragraphs':
                    this.data.display = '';
                    this.data.paragraph = reply.paragraphs[0];
                    for (let i = 0; i < reply.paragraphs.length; i++) {
                        this.data.display += '<p>' + reply.paragraphs[i].text + '</p>';
                    }
                case 'load_chapter':
                    this.data.chapter = reply;
                    break;

                case 'get_all_paragraphs':
                    this.data.display = '';
                    this.data.paragraph = reply[0];
                    this.data.chapter.paragraphs = reply;
                    for (let i = 0; i < reply.paragraphs.length; i++) {
                        this.data.display += '<p>' + reply.paragraphs[i].text + '</p>';
                    }
                    break;

                case 'load_paragraph':
                    this.data.paragraph = reply;
                    this.data.display = reply.text;
                    break;

                case 'get_wiki_hierarchy':
                    this.data.wiki = reply;
                    break;
                case 'load_wiki_page_with_sections':
                    this.data.selectedPage = reply;
                    break;

                default:
                    console.log('Unknown action: ' + action)
                    break;
            }
            delete this.outgoing[message_id];
            return action;
        });
    }

    public setStoryDisplay() {
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

    public send(message: any) {
        message.message_id = ++this.message_id;
        this.outgoing[message.message_id] = message.action;

        this.messages.next(message);
    }
}