import { ID } from "../id.model";
import { WikiSummary } from "../wiki/wiki-summary.model";

export class StorySummary {
  story_id: ID;
  title: string;
  access_level: string;
  position_context: any;
  wiki_summary: WikiSummary;
}
