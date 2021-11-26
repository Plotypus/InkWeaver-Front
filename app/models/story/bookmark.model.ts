import { ID } from '../id.model';

export class Bookmark {
    bookmark_id: ID;
    section_id: ID;
    paragraph_id: ID;
    name: string;
    index: number;
}
