import { Collaborator } from '../user/collaborator.model';

export class Story {
    story_title: string;
    access_level: string;
    story_id: string;
    section_id: string;
    wiki_id: string;
    users: Collaborator[];
    summary: string;
}