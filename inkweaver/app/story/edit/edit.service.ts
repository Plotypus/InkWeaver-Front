import { Injectable } from '@angular/core';

import { ParserService } from '../../shared/parser.service';

@Injectable()
export class EditService {
    constructor(private parserService: ParserService) { }

    public getStoryInformation(story_id: string) {
        this.parserService.send({
            action: 'get_story_information',
            story_id: story_id
        });
    }

    public getStoryHierarchy(story_id: string) {
        this.parserService.send({
            action: 'get_story_hierarchy',
            story_id: story_id
        });
    }

    public getSectionHierarchy(section_id: string) {
        this.parserService.send({
            action: 'get_section_hierarchy',
            section_id: section_id
        });
    }

    public getSectionContent(section_id: string) {
        this.parserService.send({
            action: 'get_section_content',
            section_id: section_id
        });
    }
}