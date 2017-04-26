import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, Message } from 'primeng/primeng';

import { UserService } from './user/user.service';
import { StoryService } from './story/story.service';
import { ApiService } from './shared/api.service';
import { ParserService } from './shared/parser.service';
import { WebSocketService } from './shared/websocket.service';

import jsPDF = require('jspdf');
import { ID } from './models/id.model';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;
    private items: MenuItem[];
    private collab: boolean;

    // PDF
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
        private parser: ParserService,
        private apiService: ApiService,
        private userService: UserService,
        private storyService: StoryService,
        private websocketService: WebSocketService) { }

    ngOnInit() {
        this.data = this.apiService.data;

        // Top menubar
        this.items = [
            {
                label: 'Export PDF',
                command: (event) => {
                    this.collab = false;
                    this.setDefaults();
                }
            },
            {
                label: 'Collaborators',
                command: (event) => {
                    this.collab = !this.collab;
                }
            },
            {
                label: 'User Page', command: (event) => {
                    this.collab = false;
                }, routerLink: ['/user']
            },
            {
                label: 'Sign Out',
                command: (event) => {
                    this.collab = false;
                    this.userService.signOut();
                    this.websocketService.close();
                    this.apiService.resetData();
                    this.data = this.apiService.data;
                    this.router.navigate(['/login']);
                }
            }
        ];

        // Allow ID field in paragraph tags
        let Parchment = Quill.import('parchment');
        let ID = new Parchment.Attributor.Attribute('id', 'id');
        let Class = new Parchment.Attributor.Attribute('class', 'class');
        Parchment.register(ID);
        Parchment.register(Class);
    }


    // Collaborators
    public removeCollaborator(userID: ID) {
        this.storyService.removeCollaborator(this.data.story.story_id, userID);
    }
    public addCollaborator(username: string) {
        this.storyService.addCollaborator(this.data.story.story_id, username);
    }

    // PDF
    public createPDF() {
        let allSections = this.parser.flattenTree(this.data.storyNode[0]);
        //setting the size of the pdf width margins
        this.secCount = Object.keys(allSections).length;
        let width: any = (parseInt(this.width) * 72);
        let height: any = (parseInt(this.height) * 72);
        let margin = {
            top: (this.m_top * 72),
            left: (this.m_left * 72),
            right: (this.m_right * 72),
            bottom: (this.m_bottom * 72)
        };

        let size = [width, height] as any
        let doc = new jsPDF('p', 'pt', size);
        let specialElementHandlers = {
            '#bypassme': function (element: any, renderer: any) {
                return true;
            }
        };
        this.count = 0;
        this.sectionNames = [];
        for (let id in allSections) {
            let sec: any = allSections[id].section_id;
            this.sectionNames.push(allSections[id].title);
            //getting all the chapters of the stories
            this.apiService.send({ action: 'get_section_content', section_id: sec },
                (reply: any) => {
                    this.pdfHtml = "";
                    this.parser.parseContentPDF(reply.content, this.data.aliasTable, this.data.linkTable, this.data.passiveLinkTable);

                    this.pdfHtml += "<h1>" + this.sectionNames[this.count] + "</h1>" + this.parser.setContentDisplayPDF(reply.content);
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

                        function (dispose) {
                            // dispose: object with X, Y of the last line add to the PDF 
                            //          this allow the insertion of new lines after html
                            // doc.save('Test.pdf');
                        }, margins);

                    this.count = this.count + 1;
                    if (this.count < this.secCount) {
                        doc.addPage();
                    }
                    if (this.secCount == this.count) {

                        //doc.output('dataurlnewwindow');
                        if (this.name.includes('.pdf'))
                            this.name += ".pdf";
                        doc.save(this.name);
                        this.msgs.push({ severity: 'sucess', summary: 'File Downloaded', detail: 'Check your download folder for ' + this.name });
                        this.pdf = false;
                    }

                }, { pdf: true });
        }
    }

    // Set the default values for the PDF export
    public setDefaults() {
        this.m_left = 1;
        this.m_bottom = 1;
        this.m_right = 1;
        this.m_top = 1;
        this.pdf = true;
        this.width = 8.5;
        this.height = 11;
    }
}
