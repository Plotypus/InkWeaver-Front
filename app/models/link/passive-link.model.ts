import { ID } from '../id.model';

export class PassiveLink {
    alias_id: ID;
    pending: boolean;
    deleted: boolean;
}
