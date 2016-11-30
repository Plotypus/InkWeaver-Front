import { BSON } from './bson.model';
import { Paragraph } from './paragraph.model';

export class Chapter {
    "chapter_id": BSON;
    "title": string;
    "paragraphs": Paragraph[]; // Should be ParagraphSummary
    "statistics": string;
}