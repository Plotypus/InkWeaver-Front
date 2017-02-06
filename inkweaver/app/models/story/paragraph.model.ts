import { ID } from '../id.model';
import { LinkTable } from '../link/link-table.model';

export class Paragraph {
    paragraph_id: ID;
    succeeding_id: ID;
    text: string;
    links: LinkTable;
}