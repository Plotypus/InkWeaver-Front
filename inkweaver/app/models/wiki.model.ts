import { PageSummary } from './page-summary.model';

export class Wiki {
    "id": any;
    "title": string;
    "segments": Wiki[];
    "pages": PageSummary[];
}