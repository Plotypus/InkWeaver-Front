import jsPDF = require('jspdf');
import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, Event } from '@angular/router';

import { MenuItem } from 'primeng/primeng';
import { ApiService } from '../shared/api.service';
import { ParserService } from '../shared/parser.service';

import { StoryService } from './story.service';
import { Message } from 'primeng/primeng';

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
    private sectionNames: any;
    private m_top: any;
    private m_bottom: any;
    private m_right: any;
    private m_left: any;

    msgs: Message[] = [];
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
        this.secCount = Object.keys(allSections).length - 1;
        let width:any =  (parseInt(this.width) * 72);
        let height:any = (parseInt(this.height) * 72);
        let margin = {
            top: (this.m_top *72),
            left: (this.m_left*72),
            right: (this.m_right * 72),
            bottom: (this.m_bottom * 72)
        };

        let size = [width, height] as any
        let doc = new jsPDF('p', 'pt', size);
        let specialElementHandlers = {
            '#bypassme': function(element: any, renderer: any) {
                return true;
            }
        };
        this.count = 0;
        this.sectionNames = [];
        for (let id in allSections){
            let sec:any = allSections[id].section_id;
            this.sectionNames.push(allSections[id].title);
            this.apiService.send({ action: 'get_section_content', section_id: sec }, 
                (reply: any) => {
                    this.pdfHtml = "";
                    if ( this.secCount == this.count) {
                    
                        //doc.output('dataurlnewwindow');
                        if (this.name.includes('.pdf'))
                            this.name += ".pdf";
                        doc.save(this.name);
                        this.msgs.push({ severity: 'sucess', summary: 'File Downloaded', detail: 'Check your download folder for '+this.name });
                        this.pdf = false;
                        }
                    else {
                        this.pdfHtml+="<h1>"+this.sectionNames[this.count]+"</h1>"+this.parserService.setContentDisplay(reply.content);
                        let margins = {
                            top: margin.top,
                            bottom: margin.bottom,
                            left: margin.left,
                            width: (width - margin.right - margin.left) //how much of the page to take 
                        };
                        // all coords and widths are in jsPDF instance's declared units
                        // 'inches' in this case
                        doc.fromHTML(
                            this.pdfHtml, // HTML string or DOM elem ref.
                            margins.left, // x coord
                            margins.top, { // y coord
                                'width': margins.width, // max width of content on PDF
                                'elementHandlers': specialElementHandlers
                            },

                            function(dispose) {
                                // dispose: object with X, Y of the last line add to the PDF 
                                //          this allow the insertion of new lines after html
                                //doc.save('Test.pdf');
                            }, margins);
                        

                        this.count = this.count+1;
                        if (this.count < this.secCount){
                            doc.addPage();
                        }
                    }
                },{ pdf: true });
        }

        
        
    }

    public setDefaults(){
        this.m_left = 1;
        this.m_bottom = 1;
        this.m_right = 1;
        this.m_top = 1;
        this.pdf = true;
    }
}
