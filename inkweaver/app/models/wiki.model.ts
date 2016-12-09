import { Page } from './page.model';

export class Wiki {
    "title": string;
    "id": string;
    "segments": Wiki[];
    "pages": Page[];
}