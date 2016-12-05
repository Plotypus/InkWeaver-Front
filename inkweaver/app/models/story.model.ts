import { WikiSummary } from './wiki-summary.model';
import { ChapterSummary } from './chapter-summary.model';

export class Story {
    "id": string;
    "title": string;
    "owner": string;
    "coauthors": string[];
    "statistics": string;
    "settings": string;
    "synopsis": string;
    "wiki": WikiSummary;
    "chapters": ChapterSummary[];
}