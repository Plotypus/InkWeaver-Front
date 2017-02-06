import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { WikiService } from './wiki.service';
import { ApiService } from '../../shared/api.service';
import { PageSummary } from '../../models/wiki/page-summary.model';

@Component({
    selector: 'wiki',
    templateUrl: './app/story/wiki/wiki.component.html'
})
export class WikiComponent {
    private data: any;
    private nav: any;
    private selectedEntry: TreeNode;
    private showAddDialog: any;
    private addOptions: any;
    private addContent: any;
    private pageName: any;
    private addTo: any;
    private wikiPage: any;
    private toAdd: TreeNode;
    private disabled: any;
    private icons: any;
    private temp: any;
    private wikiPageContent = [];
    private showAddHeadDialog: any;
    private showDeleteDialog: any;
    private toDelete: any;

    constructor(
        private wikiService: WikiService,
        private apiService: ApiService) { }

    ngOnInit() {

        this.data = this.apiService.data;
        this.nav = this.data.wikiNode;
        this.addOptions = [];
        this.addOptions.push({ label: 'Category', value: 'category' });
        this.addOptions.push({ label: 'Page', value: 'page' });
        this.addContent = this.addOptions[0]['value'];

        this.temp = {
            "reply_to_id": 1,
            "title": "Character",
            "segments": [],
            "pages": [
                {
                    "title": "Costa Rica",
                    "page_id": "123454321"
                },
                {
                    "title": "Jurassic Park",
                    "page_id": "543212345"
                }
            ],
            "headings": [
                {
                    "title": "Description",
                    "text": "",
                },
                {
                    "title": "History",
                    "text": "",
                }
            ]
        };

       this.apiService.messages.subscribe((action: string) => {
           if (action == 'add_page') {
               this.toAdd.data.id = this.apiService.data.pageid.pop();
               this.toAdd = {};
           }
           else if(action == 'add_segment')
           {
               this.toAdd.data.id = this.apiService.data.pageid.pop();
               this.toAdd = {};
           }
           else if (action == "get_wiki_segment" || action == 'get_wiki_page')
           {
               this.wikiPage = this.data.page;
               this.disabled = [true];
               this.icons = ['fa-pencil'];
               this.wikiPageContent.push({
                   'title': this.wikiPage.title,
                   'text': ""
               })
               this.toDelete = this.wikiPage.title;
               for (let i = 0; i < this.wikiPage.headings.length; i++) {
                   this.disabled.push(true);
                   this.icons.push('fa-pencil');
                   this.wikiPageContent.push({
                       'title': this.wikiPage.headings[i].title,
                       'text': this.wikiPage.headings[i].text
                   });
               }
           }
           
       });
    }



 

    /**
     * Switch between pages for the wiki
     * @param page
     */
    public onSelected(page: any) {

        //Take care of when the title page is clicked
        if (this.data.wiki.wiki_title == page.node.data.title) {
            this.wikiPage = null;
            this.wikiService.getWikiInformation(this.data.story.wiki_id);
        }
        else if (page.node.type == "category") {
            page.node.expanded = !page.node.expanded;
            //get information for the page. 
            this.wikiService.getWikiSegment(page.node.data.id);
            
            
        }
        else {
            this.data.selectedPage = page.node.data.id;
            this.wikiService.getWikiPage(page.node.data.id);
        }

      
    }

    /*
        Will toogle value of button variable to indicate whether something needs to be added or not
    */
    public onAddPage(event:any, page: any) {
        this.addTo = page.label;
        this.showAddDialog = true;
        this.selectedEntry = page;
        this.addContent = this.addOptions[0]['value'];
        this.pageName = "";
        event.stopPropagation();
    }
    public onDelete(event:any,page: any) {
        this.deletePage(page);
        event.stopPropagation();

    }

    public addHeading()
    {
        this.addTo = this.selectedEntry.label;
        this.addContent = "";
        this.showAddHeadDialog = true;
    }

    public createHeading(addMore: boolean) {

        if (!addMore)
            this.showAddHeadDialog = false;
        
        let temp = {};
        if (this.selectedEntry.type == 'category')
        {
            this.wikiService.addTempleteHeading(this.pageName, this.selectedEntry.data.id);
            temp = {
                'title': this.pageName,
                'text': this.addContent
            };
            this.wikiPage.headings.push(temp);
        }
        else
        {
            this.wikiService.addHeading(this.pageName, this.selectedEntry.data.id);
            temp = {
                'title': this.pageName,
                'text': this.addContent
            };
            this.wikiPage.headings.push(temp);
        }
        this.disabled.push(true);
        this.icons.push('fa-pencil');
        this.wikiPageContent.push({});
        this.addContent = "";
        this.pageName = "";
    }
    public onDisable(idx: any)
    {

        let title = "";
        let text = "";
        //saving the previous state
        if (this.disabled[idx])
        {
            this.icons[idx] = 'fa-check';
            if (idx == 0) {
                title = this.wikiPage.title;
            }
            else {
                title = this.wikiPage.headings[idx - 1].title;
                text = this.wikiPage.headings[idx - 1].text;
            }
            let prev = {
                "title": title,
                "text": text,
            }
            this.wikiPageContent.splice(idx, 1, prev); 
        }
        else {
            //need to send the new state to the server
            this.icons[idx] = 'fa-pencil';
            if (this.selectedEntry.type == 'category')
            {
                //editing the category title
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    this.wikiService.editSegment(this.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.selectedEntry.data.title = this.wikiPage.title;
                }

                //editing templete heading
            }
            //saving page information
            else {
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    this.wikiService.editPage(this.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.selectedEntry.data.title = this.wikiPage.title;
                }
                else {
                    this.wikiService.editHeading(this.selectedEntry.data.id, this.wikiPageContent[0].title, 'set_title', this.wikiPage.headings[idx - 1].title);
                }
            }
        }

        this.disabled[idx] = !this.disabled[idx];
    }

    public onCancel(idx: any)
    {
        if (idx == 0)
        {
            this.wikiPage.title = this.wikiPageContent[0].title;
        }
        else {
            this.wikiPage.headings[idx - 1].title = this.wikiPageContent[idx].title;
        }
    }

    public onSavePage()
    {
        for (let i = 0; i < this.wikiPage.headings.length; i++)
        {
            if (!(this.wikiPageContent[i + 1].text === this.wikiPage.headings[i].text))
            {
                this.wikiService.editHeading(this.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);
            }
        }
    }

    public onShow()
    {
        this.showDeleteDialog = true;
    }
    //need to ask Kyle why this cant be delete
    public onDeletePage(page:any)
    {
        this.showDeleteDialog = false;
        if (!page)
            return;
        if (this.selectedEntry.type === 'category')
            this.wikiService.deleteSegment(this.selectedEntry.data.id);
        else
            this.wikiService.deletePage(this.selectedEntry.data.id);
        this.deletePage(this.selectedEntry);

    }

    public onDeleteHeading()
    {

    }
    public addToWiki() {
        //creating the new node to be added to the navigation
        
        this.showAddDialog = false;
        this.toAdd = {};
        let toParent: TreeNode = {};
        this.toAdd.label = this.pageName;
        this.toAdd.data = new PageSummary();
        this.toAdd.data.title = this.pageName;
        this.toAdd.type = this.addContent;

        //need to figure out how to send send new segment details
        
            toParent.label = this.selectedEntry.label;
            toParent.parent = this.selectedEntry.parent;
            this.toAdd.parent = toParent;
            if (this.toAdd.type == 'category') {
                this.toAdd.children = [];
                this.wikiService.addSegment(this.pageName, this.selectedEntry.data.id);
            }
            else {
                this.wikiService.addPage(this.pageName, this.selectedEntry.data.id);
            }

            if (this.selectedEntry.type == 'title')
            {
                this.nav.push(this.toAdd);
                this.nav = this.nav.sort(this.sort);
            }
            else
            {
                this.selectedEntry.children.push(this.toAdd);
                this.selectedEntry.children=this.selectedEntry.children.sort(this.sort);
            }
            

        

        //need to send this info over network and get id;
        this.addContent = this.addOptions[0]['value'];
        this.pageName = "";
    }
    public deletePage(page: any) {
        //need to find location of page
        let path = Array<String>();
        let parent = page;
        while (typeof parent !== 'undefined') {
            path.push(parent.label);
            parent = parent.parent;
        }
        path = path.reverse();

        let level = 0;
        for (let index = 1; index < this.nav.length; index++) {
            if (this.findPage(this.nav[index], path, level))
                break;
        }

    }

    //need to figure out a way to delete categories
    private findPage(search: any, path: Array<String>, index: any): boolean {
        
        if (search.label == path[index] && index != path.length - 1) {
            for (let page in search.children) {

                if (this.findPage(search.children[page], path, index + 1)) {
                    search.children.splice(page, 1);
                    return false;
                }
            }
        }
        else if (search.label == path[index] && index == path.length - 1) {

            return true;
        }
        else {
            return false;
        }
    }

    public sort(o1:any,o2:any)
    {
        if (o1.type == 'category' && o2.type == 'category')
            return 0;
        else if (o1.type == 'category' && o2.type == 'title')
            return 1;
        else if (o1.type == 'title' && o2.type == 'category')
            return -1;
        else if (o1.type == 'category' && o2.type == 'page')
            return -1;
        else if (o1.type == 'page' && o2.type == 'category')
            return 1;
        else if (o1.type == 'page' && o2.type == 'title')
            return 1;
        else if (o1.type == 'title' && o2.type == 'page')
            return -1;
        else
            return 0;
        
    }



}
