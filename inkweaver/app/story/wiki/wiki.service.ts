import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class WikiService {
    constructor(private apiService: ApiService) { }

    public getWikiInformation(wiki_id: string) {
        this.apiService.send({
            action: 'get_wiki_information',
            wiki_id: wiki_id
        });
    }

    public getWikiHierarchy(wiki_id: string) {
        this.apiService.send({
            action: 'get_wiki_hierarchy',
            wiki_id: wiki_id
        });
    }

    public getWikiSegmentHierarchy(segment_id: string) {
        this.apiService.send({
            action: 'get_wiki_segment_hierarchy',
            segment_id: segment_id
        });
    }

    public getWikiPage(page_id: string) {
        this.apiService.send({
            action: 'get_wiki_page',
            page_id: page_id
        });
    }
}