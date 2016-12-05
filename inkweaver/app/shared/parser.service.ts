import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Story } from '../models/story.model';
import { ChapterSummary } from '../models/chapter-summary.model';
import { Chapter } from '../models/chapter.model';
import { Paragraph } from '../models/paragraph.model';
import { WebSocketService } from './websocket.service';

const url = 'ws://localhost:8080/ws/v2/test';

@Injectable()
export class ParserService {
    public display: string = '';
    public paragraph: Paragraph = { 'id': '', 'text': '', 'statistics': '' };
    public chapter: Chapter = { 'id': '', 'title': '', 'statistics': '', 'paragraphs': [this.paragraph] };
    public selectedChapter: ChapterSummary = { 'id': '', 'title': '' };
    public story: Story = { 'id': '', 'title': '', 'owner': '', 'coauthors': [], 'statistics': '', 'settings': '', 'synopsis': '', 'wiki': { 'id': '', 'title': '' }, 'chapters': [this.chapter] };

    public data = {
        'story': this.story,
        'selectedChapter': this.selectedChapter,
        'chapter': this.chapter,
        'paragraph': this.paragraph,
        'display': this.display
    }

    public outgoing = {};
    public message_id: number = 0;
    public messages: Subject<string>;

    constructor(socket: WebSocketService) {
        this.messages = <Subject<string>>socket
            .connect(url).map((response: MessageEvent): string => response.data);

        this.messages.subscribe(response => {
            let reply = JSON.parse(response);
            let message_id: number = reply.reply_to;
            let action: string = this.outgoing[message_id];

            switch (action) {
                case 'get_user_info':
                    this.send({ 'action': 'load_story_with_chapters', 'story': reply.stories[0].id });
                    break

                case 'load_story_with_chapters':
                    this.send({ 'action': 'load_chapter_with_paragraphs', 'chapter': reply.chapters[0].id });
                    this.data.selectedChapter = reply.chapters[0];
                case 'load_story':
                    this.data.story = reply;
                    break;

                case 'get_all_chapters':
                    this.data.story.chapters = reply;
                    this.data.selectedChapter = reply[0];
                    this.send({ 'action': 'load_chapter_with_paragraphs', 'chapter': reply[0].id });
                    break;

                case 'load_chapter_with_paragraphs':
                    this.data.display = '';
                    this.data.paragraph = reply.paragraphs[0];
                    for (let paragraph of reply.paragraphs) {
                        this.data.display += paragraph.text + '\n\n';
                    }
                case 'load_chapter':
                    this.data.chapter = reply;
                    break;

                case 'get_all_paragraphs':
                    this.data.display = '';
                    this.data.chapter.paragraphs = reply;
                    this.data.paragraph = reply.paragraphs[0];
                    for (let paragraph of reply.paragraphs) {
                        this.data.display += paragraph.text + '\n\n';
                    }
                    break;

                case 'load_paragraph':
                    this.data.paragraph = reply;
                    this.data.display = reply.text;
                    break;

                default:
                    console.log('Unknown action: ' + action)
                    break;
            }
            delete this.outgoing[message_id];
        })
    }

    public send(message: any) {
        message.message_id = ++this.message_id;
        this.outgoing[message.message_id] = message.action;

        this.messages.next(message);
    }
}