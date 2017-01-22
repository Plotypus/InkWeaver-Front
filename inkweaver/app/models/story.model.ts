import { Collaborator } from './collaborator.model';

export class Story {
    story_title: string;
    section_id: string;
    wiki_id: string;
    users: Collaborator[];
    summary: string;
}