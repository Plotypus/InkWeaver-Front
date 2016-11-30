import { BSON } from './bson.model';
import { AuthorSummary } from './author-summary.model';

export class StorySumamry {
    "story_id": BSON;
    "title": string;
    "authors": AuthorSummary[];
    "synopsis": string;
}