import { BSON } from './bson.model';
import { ParagraphSummary } from './paragraph-summary.model';

export class Chapter {
    "chapter_id": BSON;
    "title": string;
    "paragraphs": ParagraphSummary[];
    "statistics": string;
}