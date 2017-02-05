import { Collaborator } from '../user/collaborator.model';

export class Wiki {
    wiki_title: string;
    segment_id: string;
    users: Collaborator[];
    summary: string;
}