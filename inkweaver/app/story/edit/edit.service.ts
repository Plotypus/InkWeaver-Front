import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class EditService {
    constructor(private apiService: ApiService) { }

    public getStoryInformation(story_id: string) {
        this.apiService.send({
            action: 'get_story_information',
            story_id: story_id
        });
    }

    public getStoryHierarchy(story_id: string) {
        this.apiService.send({
            action: 'get_story_hierarchy',
            story_id: story_id
        });
    }

    public getSectionHierarchy(section_id: string) {
        this.apiService.send({
            action: 'get_section_hierarchy',
            section_id: section_id
        });
    }

    public getSectionContent(section_id: string) {
        this.apiService.send({
            action: 'get_section_content',
            section_id: section_id
        });
    }

    public compare(obj1, obj2) {
        let expected: number = 0;
        for (let i = 0; i < obj2.length; i++) {
            let obj: any = obj2[i];

            if (obj.index) {
                if (obj.index != expected) {
                    console.log('Delete paragraph at index ' + i);
                } else {
                    let oldObj = obj1[expected];

                    console.log('Edit paragraph at index ' + i);
                    for (let link of oldObj.links) {
                        console.log('Remove link ' + link + ' at paragraph ' + i);
                    }
                    for (let link of obj.links) {
                        console.log('Add link ' + link + ' at paragraph ' + i);
                    }
                }
                expected++;
            } else {
                console.log('Add paragraph at index ' + i);
                for (let link of obj.links) {
                    console.log('Add link ' + link + ' at paragraph ' + i);
                }
            }
        }
    }
}