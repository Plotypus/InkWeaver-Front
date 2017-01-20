import { PageSummary } from './page-summary.model';

export class Segment {
    title: string;
    segment_id: string;
    segments: Segment[];
    pages: PageSummary[];
}