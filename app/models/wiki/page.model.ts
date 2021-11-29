import { Heading } from "./heading.model";
import { Reference } from "./reference.model";

export class Page {
  title: string;
  aliases: any;
  references: Reference[];
  headings: Heading[];
}
