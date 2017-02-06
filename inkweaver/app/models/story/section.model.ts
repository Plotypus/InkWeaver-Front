import { ID } from '../id.model';

export class Section {
    title: string;
    section_id: ID;
    preceding_subsections: Section[];
    inner_subsections: Section[];
    succeeding_subsections: Section[];
}