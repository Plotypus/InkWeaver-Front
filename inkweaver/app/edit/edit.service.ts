import { Injectable } from '@angular/core';

import { ParserService } from '../shared/parser.service';

@Injectable()
export class EditService {
    constructor(private parser: ParserService) { }

    public getUserInfo() {
        this.parser.send({
            'action': 'get_user_info'
        });
    }

    // -------------------- STORY -------------------- //
    public loadStory(story_id: string) {
        this.parser.send({
            'action': 'load_story',
            'story': story_id
        });
    }

    public loadStoryWithChapters(story_id: string) {
        this.parser.send({
            'action': 'load_story_with_chapters',
            'story': story_id
        });
    }

    // -------------------- CHAPTERS -------------------- //
    public getAllChapters() {
        this.parser.send({
            'action': 'get_all_chapters'
        });
    }

    public loadChapter(chapter_id: string) {
        this.parser.send({
            'action': 'load_chapter',
            'chapter': chapter_id
        });
    }

    public loadChapterWithParagraphs(chapter_id: string) {
        this.parser.send({
            'action': 'load_chapter_with_paragraphs',
            'chapter': chapter_id
        });
    }

    // -------------------- PARAGRAPH -------------------- //
    public getAllParagraphs() {
        this.parser.send({
            'action': 'get_all_paragraphs'
        });
    }

    public loadParagraph(paragraph_id: string) {
        this.parser.send({
            'action': 'load_paragraph',
            'paragraph': paragraph_id
        });
    }
}
