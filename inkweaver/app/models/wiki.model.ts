import { Pages } from './pages.model';

export class Wiki {
    "title": string;
    "id": string;
    "segments": Wiki[];
    "pages": Pages[];
}