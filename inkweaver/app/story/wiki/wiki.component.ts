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
    private nav: any;


    constructor(
        private wikiService: WikiService,
        private apiService: ApiService) { }

    ngOnInit() {

        this.data = this.apiService.data;
        this.nav = this.apiService.data.wikiNav;
        this.addOptions = [];
        this.addOptions.push({ label: 'Category', value: 'category' });
        this.addOptions.push({ label: 'Page', value: 'page' });
        this.addContent = this.addOptions[0]['value'];
        if (this.data.page.hasOwnProperty("title"))
        {
            this.parsePage();
        }


       this.apiService.messages.subscribe((action: string) => {
         if (action == "get_wiki_segment" || action == 'get_wiki_page')
         {
             this.wikiPageContent = [];
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
         else if (action.includes("delete"))
         {
             this.wikiService.getWikiHierarchy(this.data.story.wiki_id);
             if(action == "alias_deleted")
             {
                this.wikiService.getWikiPage(this.data.selectedEntry.data.id);
             }
         }
       
           
       });
    }



    public parsePage()
    {
        this.wikiPageContent = [];
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
        
             //getting the references

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

    /**
     * All adding methods
     */

    public addToWiki() {
        //creating the new node to be added to the navigation

        this.showAddDialog = false;

        if (this.addContent == 'category') {

            this.wikiService.addSegment(this.pageName, this.data.selectedEntry.data.id);
        }
        else {
            this.wikiService.addPage(this.pageName, this.data.selectedEntry.data.id);
        }
        
        //need to send this info over network and get id;
        this.addContent = this.addOptions[0]['value'];
        this.pageName = "";
    }

    /*
        Will toogle value of button variable to indicate whether something needs to be added or not
    */
    public onAddPage(event: any, page: any) {
        this.addTo = page.label;
        this.showAddDialog = true;
        this.data.selectedEntry = page;
        this.addContent = this.addOptions[0]['value'];
        this.pageName = "";
        event.stopPropagation();
    }


    public addHeading()
    {
        this.addTo = this.data.selectedEntry.label;
        this.addContent = "";
        this.showAddHeadDialog = true;
    }

    public createHeading(addMore: boolean) {

        if (!addMore)
            this.showAddHeadDialog = false;

        let temp = {};
        if (this.data.selectedEntry.type == 'category')
        {
            this.wikiService.addTempleteHeading(this.pageName, this.data.selectedEntry.data.id);
            
            temp = {
                'title': this.pageName,
                'text': this.addContent
            };
            this.wikiPage.headings.push(temp);
        }
        else
        {
            this.wikiService.addHeading(this.pageName, this.data.selectedEntry.data.id);
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
    public onDisable(idx: any) {

        let title = "";
        let text = "";
        //saving the previous state
        if (this.disabled[idx]) {
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
            if (this.data.selectedEntry.type == 'category')
            {
                //editing the category title
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    this.wikiService.editSegment(this.data.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.data.selectedEntry.data.title = this.wikiPage.title;
                }
                else if (idx != 0 && !(this.wikiPageContent[idx].title === this.wikiPage.title))
                {
                    this.wikiService.editTempleteHeading(this.data.selectedEntry.data.id, this.wikiPageContent[idx].title, "set_title", this.wikiPage.headings[idx - 1].title);
                    //editing templete heading
                }


            }
            //saving page information
            else {
                if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                    //sending a null response so server closes connection
                    this.wikiService.editPage(this.data.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                    this.data.selectedEntry.data.title = this.wikiPage.title;
                }
                else if (idx != 0 && !(this.wikiPageContent[idx].title === this.wikiPage.title)) {
                    this.wikiService.editHeading(this.data.selectedEntry.data.id, this.wikiPageContent[idx].title, 'set_title', this.wikiPage.headings[idx - 1].title);
                }
            }
        }

        this.disabled[idx] = !this.disabled[idx];
    }

    public onCancel(idx: any) {
        if (idx == 0) {
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
                if (this.data.selectedEntry.type == 'category')
                    this.wikiService.editTempleteHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);

                    else
                this.wikiService.editHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);
            }
        }
    }


    public editAlias(alias: any) {
        //enable the textbox
        if (alias.state) {
            alias.state = !alias.state;
            alias.icon = "fa-check"
            alias.prev = alias.name;
        }
        //disable textbox
        else {
            alias.state = !alias.state;
            alias.icon = "fa-pencil"
            if (!(alias.prev === alias.name))
                this.wikiService.editAlias(alias.id, alias.name);
            alias.prev = "";
        }
    }

    public cancelAlias(alias: any) {
        alias.name = alias.prev;
    }

    public deleteAlias(alias: any) {
        this.wikiService.deleteAlias(alias.id);
    }

    //Delete Methods
    public onShow() {
        this.showDeleteDialog = true;
    }

    public onDeletePage(page: any) {
        this.showDeleteDialog = false;
        if (!page)
            return;
        if (this.data.selectedEntry.type === 'category')
            this.wikiService.deleteSegment(this.data.selectedEntry.data.id);
        else
            this.wikiService.deletePage(this.data.selectedEntry.data.id);
    }



    public onDeleteHeading() {

    }



    public sort(o1: any, o2: any) {
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
