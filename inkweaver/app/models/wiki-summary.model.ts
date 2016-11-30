import { BSON } from './bson.model';
import { CategorySummary } from './category-summary.model';

export class WikiSummary {
    "wiki_id": BSON;
    "title": string;
    "categories": CategorySummary[];
}