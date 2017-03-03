import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class StatsService {
    constructor(private parser: ApiService) { }

    public get_story_statistics(sid: any) {
        this.parser.send({
            action: 'get_story_statistics',
            story_id: sid
        });
    }

    public get_section_statistics(sid: any) {
        this.parser.send({
            action: 'get_section_statistics',
            section_id: sid
        });
    }

    public get_paragraph_statistics(sid: any, pid: any) {
        this.parser.send({
            action: 'get_paragraph_statistics',
            section_id: sid,
            paragragh_id:pid
        });
    }

    public get_page_frequency(sid:any,wid:any)
    {
        this.parser.send({
            action: 'get_page_frequencies',
            story_id:sid,
            wiki_id:wid
        })
    }
}