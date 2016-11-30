import { BSON } from './bson.model';
import { AuthorSummary } from './author-summary.model';
import { ChapterSummary } from './chapter-summary.model';

export class Story {
    "story_id": BSON;
    "title": string;
    "authors": AuthorSummary[];
    "wiki_id": BSON;
    "synopsis": string;
    "chapters": ChapterSummary[];
    "statistics": string;
}