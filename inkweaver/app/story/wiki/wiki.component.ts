import { Component, OnInit, ViewChildren } from '@angular/core';
import { TreeNode, Editor, MenuItem } from 'primeng/primeng';
import { Router } from '@angular/router';

import { EditService } from '../edit/edit.service';
import { WikiService } from './wiki.service';
import { ApiService } from '../../shared/api.service';
import { ParserService } from '../../shared/parser.service';
import { PageSummary } from '../../models/wiki/page-summary.model';
import { FilterPipe } from './filter.pipe';

@Component({
    selector: 'wiki',
    templateUrl: './app/story/wiki/wiki.component.html'
})
export class WikiComponent {

    private data: any;
    private showAddDialog: any;
    
    private addContent: any;
    private pageName: any;
    private addTo: any;
    private wikiPage: any;
    private toAdd: TreeNode;
    private disabled: any;
    private icons: any;
    private temp: any;
    private wikiPageContent = [];
    private showAddHeadDialog = false;
    private showDeleteDialog = false;;
    private toDelete: any;
    private nav: any;
    private info: boolean;


    //adding and deleting pages anc categories
    private allCategories = [];
    private allPages = [];
    private nestedPages = [];
    private defAdd: any;
    private defDel: any;
    private wiki = [];
    private selectedValues = [];
    private selectAllVal: boolean;
    private filter: string;
    private rename: boolean;

    //adding and deleting templetes
    private headingName:any;
    private heading: any;
    private exist: boolean;
    private empty: boolean;
    private type: any;
    private headID: any;

    //context menus
    private contextMenuItems: MenuItems[];


    constructor(
        private wikiService: WikiService,
        private apiService: ApiService,
        private editService: EditService,
        private parserService:ParserService,
        private router: Router) {}

    ngOnInit() {

        this.data = this.apiService.data;
        this.nav = this.apiService.data.wikiNav;
        this.filter = "";
        this.data.wikiFuctions.push(this.onTempleteHeadingCallback());


        if ( this.data.page != null && this.data.page.hasOwnProperty("title")) {
            this.parsePage();
        }else
        this.data.selectedEntry = this.data.wikiNav[0];

        this.updateData();

        this.apiService.messages.subscribe((action: string) => {

            if (action == "alias_deleted") {
                this.wikiService.getWikiPage(this.data.selectedEntry.data.id,this.onGetCallback());
            }
            else if (action == "got_wiki_information")
            {
                this.info = true;
            }
            else if (action == "got_wiki_hierarchy" && this.info)
            {
                this.data.selectedEntry = this.data.wikiNav[0];
                this.info = false;
                
            }
        });

    }


    public setContextMenu(node:any){
        this.data.selectedEntry = node;
        if(node.type == 'page'){
            this.contextMenuItems = [{ label: 'Rename', command: () => { this.rename = true;  } },

            { label: 'Delete', command: () => { onShow(0); } }];
        }
        else if(node.type == 'category' || node.type == 'title')
        {
            this.contextMenuItems = [{ label: 'Rename', command: () => { this.openSectionRenamer(); } },
            { label: 'Add Category', command: () => { onAddPage(0); } },
            { label: 'Add Page', command: () => { onAddPage(0); } },
            { label: 'Delete', command: () => { onShow(0); } }];
        }
    }


    //Get Page/Segment stuff

    /**
     * Switch between pages for the wiki
     * @param page
     */
     public onSelected(page: any) {

         //Take care of when the title page is clicked
         if(page.node.type == 'filler')
             return;

         if (page.node.type == 'title') {
             this.wikiPage = null;
             this.apiService.refreshWikiInfo();

         }
         else if (page.node.type == "category") {
             page.node.expanded = !page.node.expanded;
             //get information for the page.
             this.wikiService.getWikiSegment(page.node.data.id, this.onGetCallback());
         }
         else {

             this.wikiService.getWikiPage(page.node.data.id, this.onGetCallback());
         }
         this.data.selectedEntry = page.node;

     }

     public parsePage() {
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
                 'text': this.wikiPage.headings[i].text,
                 'active': false
             });
         }



     }



    /**
     * All adding methods
     */

     public addToWiki(add:boolean) {
         //creating the new node to be added to the navigation

         this.showAddDialog = false;
         if (add) {
             if (this.addContent == 'Category') {

                 this.wikiService.addSegment(this.pageName, this.data.selectedEntry.data.id, this.onAddCallback());
             }
             else {
                 this.wikiService.addPage(this.pageName, this.data.selectedEntry.data.id, this.onAddCallback());
             }

             //need to send this info over network and get id;
             this.pageName = "";
         }
     }

    /*
        Will toogle value of button variable to indicate whether something needs to be added or not
        */
        public onAddPage(type:any) {
            this.showAddDialog = true;
            if (type == 0)
                this.addContent = "Category";
            else
                this.addContent = "Page";
            this.pageName = "";
            let idx = this.allCategories.findIndex(this.selectedEntry());
            if (idx != -1)
                this.defAdd = this.allCategories[idx].value;
        }


        public addHeading() {

            if (this.data.selectedEntry.type == 'category')
                this.heading = "Templete Heading";
            else
                this.heading = "Heading"; 
            this.headingName = "";
            this.showAddHeadDialog = true;
        }

        public createHeading(addMore: boolean) {

            if (!addMore)
                this.showAddHeadDialog = false;

            let temp = {};
            if (this.data.selectedEntry.type == 'category') {
                this.wikiService.addTempleteHeading(this.headingName, this.data.selectedEntry.data.id);
            }
            else {
                this.wikiService.addHeading(this.headingName, this.data.selectedEntry.data.id);

            }
            temp = {
                'title': this.headingName,
                'text': "",
            };

            this.wikiPage.headings.push(temp);
            temp['active'] = false;
            this.wikiPageContent.push(temp);

            this.onEdit(this.wikiPageContent.length - 1);
            this.disabled.push(true);
            this.icons.push('fa-pencil');
            this.headingName = "";
        }

        public expandPath(page: TreeNode) {
            if (!(page.hasOwnProperty("type") && page.type === 'title')) {

                let parent = page.parent;
                while (typeof parent !== 'undefined') {
                    if(parent.type === 'category')
                        parent.expanded = true;
                    parent = parent.parent;
                }
                
                
            }

        }

        public onTextChange(text:string)
        {
            //this.wikiPageContent.filter(heading => heading.title === text);
            this.exist = false;
            if (this.wikiPageContent.filter(heading => heading.title === text).length != 0)
                this.exist = true;
            
        }

        //-----------------------------Editing stuff---------------------------------------------

        public onEdit(idx: any) {
            for (let i = 1; i < this.wikiPageContent.length; i++) {
                this.wikiPageContent[i].active = false;
                let temp = this.wikiPage.headings[i - 1].text;
                this.wikiPage.headings[i - 1].text = "";
                this.wikiPage.headings[i - 1].text = temp;
            }
            this.wikiPageContent[idx].active = true;
            this.onSavePage();
        }

        public onDisable(idx: any) {

            let title = "";
            let text = "";

            //saving the previous state
            if (this.disabled[idx]) {
                this.icons[idx] = 'fa-check';
                if (idx == 0) {
                    title = this.wikiPage.title;
                    this.wikiPageContent[idx]["title"] = title;
                }
                else {
                    title = this.wikiPage.headings[idx - 1].title;
                    this.wikiPageContent[idx]["title"] = title;
                }
                

                // this.wikiPageContent.splice(idx, 1, prev);
            }
            else {
                //need to send the new state to the server
                this.icons[idx] = 'fa-pencil';
                if (this.data.selectedEntry.type == 'category') {
                    //editing the category title
                    if (idx == 0 && !(this.wikiPageContent[0].title === this.wikiPage.title)) {
                        this.wikiService.editSegment(this.data.selectedEntry.data.id, 'set_title', this.wikiPage.title);
                        this.data.selectedEntry.data.title = this.wikiPage.title;
                    }
                    else if (idx != 0 && !(this.wikiPageContent[idx].title === this.wikiPage.title)) {
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
            this.disabled[idx] = !this.disabled[idx];
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
            alias.state = true;
        }

        //----------------------------------Save Methods--------------------------------------------------

        public onSavePage() {
            for (let i = 0; i < this.wikiPage.headings.length; i++) {
                if (!(this.wikiPageContent[i + 1].text === this.wikiPage.headings[i].text)) {
                    this.wikiPageContent[i + 1].text = this.wikiPage.headings[i].text;
                    if (this.data.selectedEntry.type == 'category')
                        this.wikiService.editTempleteHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);

                    else
                        this.wikiService.editHeading(this.data.selectedEntry.data.id, this.wikiPage.headings[i].title, 'set_text', this.wikiPage.headings[i].text);
                }
            }
        }




        



        //-----------------------------------------Delete Methods----------------------------------------------------
        public onShow(id:any, idx?:any) {
            //need take care of the case where nested section is selected but pages in it are not
            //this is set stuff up for deleting page or segment
            this.type = id;
            if(this.type == 0){
                let idx = this.wiki.findIndex(this.selectedEntry());
                if (idx != -1)
                    this.defDel = this.wiki[idx].value;
                this.nestedPages = this.convertLabelValueArray(this.defDel);
            }
            //this will delete templete heading or heading
            else if(this.type == 1)
            {
                this.headID = idx;
                this.defDel = this.wikiPageContent[idx].title;

            }
            this.showDeleteDialog = true;

        }

        public onDeletePage(page: any) {
            this.showDeleteDialog = false;
            if (!page)
                return;
            if (this.data.selectedEntry.type === 'category')
                this.wikiService.deleteSegment(this.data.selectedEntry.data.id, this.onDeleteCallback());
            else
                this.wikiService.deletePage(this.data.selectedEntry.data.id, this.onDeleteCallback());
            this.wikiPage = null;
            this.data.page = null;
            this.data.selectedEntry = this.data.wikiNav[0];
        }


        public deleteAlias(alias: any) {
            this.wikiService.deleteAlias(alias.id);
        }


        public onDeleteHeading(del:any) {
            this.showDeleteDialog = false;
            if(del)
            {
                if(this.data.selectedEntry.type === 'category')
                {
                    this.wikiService.deleteTempleteHeading(this.data.selectedEntry.data.id, this.defDel);

                }
                else
                {
                    this.wikiService.deleteHeading(this.data.selectedEntry.data.id, this.defDel);
                    

                }
                this.wikiPageContent.splice(this.headID, 1);
                this.wikiPage.headings.splice(this.headID-1, 1);
            }


        }

        public onReference(ref: any) {
            this.apiService.refreshStoryContent(ref.section_id, ref.paragraph_id, null);
            this.router.navigate(['/story/edit']);
        }

        public updateData(){

            let ele: TreeNode
            let temp= [];
            if(this.data.wikiNav){
                temp = this.parserService.getTreeArray(this.data.wikiNav[0]);
                for( let idx in temp)
                {    
                    ele = temp[idx];
                    if(ele.type == 'category' || ele.type == 'title')
                    {
                        this.allCategories.push({ label: ele.label, value: ele });
                    }
                    else
                        this.allPages.push({ label: ele.label, value: ele });
                    this.wiki.push({ label: ele.label, value: ele });
                }
                
            }
        }

        public convertLabelValueArray(node:TreeNode){
            if (node) {
                let result = [];
                let temp = this.parserService.getTreeArray(node);
                for (let idx in temp) {
                    result.push({ label: temp[idx].label, value: temp[idx] });
                }
                return result;
            }
            return [];
        }

        public selectedEntry() {
            return (option: any) => {
                return this.data.selectedEntry.label === option.label;
            }
        }

        public onTempleteHeadingCallback(): Function{
            return (reply:any) =>
            {
                if (reply.event.includes('heading_added'))
                {

                    let temp = {
                        'title': reply.title,
                        'text': "",
                    };

                    this.wikiPage.headings.push(temp);
                    temp['active'] = false;
                    this.wikiPageContent.push(temp);

                    this.onEdit(this.wikiPageContent.length - 1);
                    this.disabled.push(true);
                    this.icons.push('fa-pencil');

                }
                else if (reply.event.includes('heading_updated'))
                {

                    let idx = this.wikiPage.headings.findIndex((ele: any) => (ele.title === reply.template_heading_title) || (ele.title === reply.heading_title));
                    if(reply.update.update_type === 'set_title')
                    {
                        this.wikiPage.headings[idx].title = reply.update.title;
                        this.wikiPageContent[idx + 1].title = reply.update.title;
                    }
                    else
                    {
                        this.wikiPage.headings[idx].text = reply.update.text;
                        this.wikiPageContent[idx + 1].text = reply.update.text;
                    }
                }
                else if (reply.event.includes('heading_deleted')) {
                    let idx = this.wikiPage.headings.findIndex((ele: any) => (ele.title === reply.template_heading_title) || (ele.title === reply.heading_title));
                    if(idx != -1)
                    {
                        this.wikiPageContent.splice(idx, 1);
                        this.wikiPage.headings.splice(idx - 1, 1);
                    }
                }
                else
                {

                }
            }
        }

        public onHeadingCallback():Function {
            return (reply:any)=>{

            }
        }
        public onAddCallback() : Function
        {
            return (reply:any) => {
                if(reply.event === "segment_added")
                {
                    this.data.selectedEntry = this.parserService.findSegment(this.data.wikiNav[0],reply.segment_id);
                    this.wikiService.getWikiSegment(reply.segment_id,this.onGetCallback());
                }
                else if(reply.event ==="page_added")
                {
                    this.data.selectedEntry = this.parserService.findPage(this.data.wikiNav[0], reply.page_id);
                    this.wikiService.getWikiPage(reply.page_id,this.onGetCallback());
                }
                this.expandPath(this.data.selectedEntry);
                this.updateData();
            }
        }

        public onDeleteCallback() : Function {
            return (reply:any) =>{
                this.updateData();
            }
        }
        public onGetCallback() : Function 
        {
            return (reply:any) => {
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
                        'text': this.wikiPage.headings[i].text,
                        'active': false
                    });
                }
            }
        }

        
    }