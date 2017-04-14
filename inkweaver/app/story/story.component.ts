import jsPDF = require('jspdf');
import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, Event } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { ApiService } from '../shared/api.service';
import { ParserService } from '../shared/parser.service';

import { StoryService } from './story.service';
//import jsPDF  from 'jspdf'

import { ID } from '../models/id.model';
@Component({
    selector: 'story',
    templateUrl: './app/story/story.component.html'
})
export class StoryComponent {

    private data: any;
    private items: MenuItem[];
    private activeItem: MenuItem;

    private editing: boolean;
    private prevTitle: string;

    //pdf
    private pdf: boolean;
    private name: any;
    private width: any;
    private height: any;
    private secCount: number;
    private count: number;
    private pdfHtml: any;

    constructor(
        private router: Router,
        private apiService: ApiService,
        private storyService: StoryService,
        private parserService: ParserService) { }

    ngOnInit() {
        this.data = this.apiService.data;
        this.items = [
            { label: '', disabled: true, icon: 'fa-pencil-square-o', routerLink: ['/story/edit'] },
            { label: '', disabled: true, icon: 'fa-book', routerLink: ['/story/wiki'] },
        ];
        this.activeItem = this.items[0];

        // This changes the navigation bar highlight
        this.router.events
            .filter((event: Event) => event instanceof NavigationStart)
            .subscribe((event: Event) => {
                if (event.url === '/story/edit') {
                    this.activeItem = this.items[0];
                }
                else if (event.url === '/story/wiki') {
                    this.activeItem = this.items[1];
                }

            });

        this.data.storyFunction = this.disableMenu();
    }

    public disableMenu(): Function {
        return (reply: any) => {
            for (let item of this.items) {
                item['disabled'] = false;
            }
            delete this.data.storyFunction;
        }
    }

    public edit() {
        this.editing = true;
        this.prevTitle = this.data.story.story_title;
    }
    public save() {
        this.editing = false;
        this.storyService.editStory(this.data.story.story_id, this.data.story.story_title);
    }
    public cancel() {
        this.editing = false;
        this.data.story.story_title = this.prevTitle;
    }

    // Collaborators
    public removeCollaborator(userID: ID) {
        this.storyService.removeCollaborator(userID);
    }
    public addCollaborator(username: string) {
        this.storyService.addCollaborator(username);
    }

    //PDF

    public createPDF(){
        
        let allSections = this.parserService.flattenTree(this.data.storyNode[0]);
        this.secCount = Object.keys(allSections).length;
        let width:any =  Math.round(parseInt(this.width) * 25);
        let height:any = Math.round(parseInt(this.height) * 25);
        let size = [width, height];
        let doc = new jsPDF('p', 'mm', 'letter');
        let  specialElementHandlers = {};
        for (let id in allSections){
            let sec:any = allSections[id].section_id;
            this.apiService.send({ action: 'get_section_content', section_id: sec }, (reply: any) => {
                if (this.secCount == this.count) {
                    doc.fromHTML(this.pdfHtml, 15, 15, {
                        'width': 250,
                        'margin': 1,
                        'pagesplit': true, //This will work for multiple pages
                        'elementHandlers': specialElementHandlers
                    });
                    doc.output('dataurlnewwindow');
                    if (this.name.includes('.pdf'))
                        this.name += ".pdf";
                    doc.save(this.name);
                }
                else {
                    this.pdfHtml+=this.parserService.setContentDisplay(reply.content);
                    this.count = this.count+1;
                }
            },
                { pdf: true });
        }

        
        
    }
}
