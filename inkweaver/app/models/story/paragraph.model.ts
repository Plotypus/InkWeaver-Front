import { ID } from '../id.model';
import { AliasTable } from '../link/alias-table.model';

export class Paragraph {
    paragraph_id: ID;
    preceding_paragraph_id: ID;
    succeeding_paragraph_id: ID;
    text: string;
    links: AliasTable;
    passiveLinks: AliasTable;
    note: string;
}
