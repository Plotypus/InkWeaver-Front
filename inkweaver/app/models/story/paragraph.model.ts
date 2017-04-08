import { ID } from '../id.model';
import { PageTable } from '../link/page-table.model';

export class Paragraph {
    paragraph_id: ID;
    succeeding_id: ID;
    text: string;
    links: PageTable;
    note: string;
}
