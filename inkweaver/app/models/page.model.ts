import { Section } from './section.model';

export class Page {
    "id": any;
    "title": string;
    "aliases": string[];
    "references": string[];
    "sections": Section[];
}