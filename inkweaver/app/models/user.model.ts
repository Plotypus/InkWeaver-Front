import { StorySummary } from './story-summary.model';
import { WikiSummary } from './wiki-summary.model';

export class AuthorSummary {
    "id": string;
    "username": string;
    "avatar": string;
    "email": string;
    "name": string;
    "pen_name": string;
    "stories": StorySummary[];
    "wikis": WikiSummary[];
    "bio": string;
    "statistics": string;
    "preferences": string;
}