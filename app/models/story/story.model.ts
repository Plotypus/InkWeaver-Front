import { ID } from "../id.model";
import { Collaborator } from "../user/collaborator.model";

export class Story {
  story_title: string;
  access_level: string;
  story_id: ID;
  section_id: ID;
  wiki_id: ID;
  position_context: any;
  users: Collaborator[];
}
