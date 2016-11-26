import { BSON } from './bson.model';
import { Category } from './category.model';
import { PageSummary } from './page-summary.model';

export class Wiki {
    "wiki_id": BSON;
    "title": string;
    "categories": Category[];
    "pages": PageSummary[];
}