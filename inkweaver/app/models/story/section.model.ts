export class Section {
    title: string;
    section_id: string;
    preceding_subsections: Section[];
    inner_subsections: Section[];
    succeeding_subsections: Section[];
}