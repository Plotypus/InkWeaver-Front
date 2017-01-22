import { Heading } from './heading.model';

export class Page {
    title: string;
    aliases: string[];
    references: string[];
    headings: Heading[];
}