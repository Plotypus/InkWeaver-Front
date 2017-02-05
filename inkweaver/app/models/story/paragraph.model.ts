import { LinkTable } from '../link/link-table.model';

export class Paragraph {
    paragraph_id: string;
    succeeding_id: string;
    text: string;
    links: LinkTable;
}