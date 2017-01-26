import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class WikiService {
    constructor(private apiService: ApiService) { }

    //All the GETS
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

    //EDITS
    public editSegment(segment_id: string, update_type:string, new_text: String)
    {
        this.parserService.send({
                action: 'edit_segment',
                "segment_id": segment_id,
                "update": {
                    "update_type": "set_title",
                    "title": new_text
                    }
                });
    }

    //CREATES


}