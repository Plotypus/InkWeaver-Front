﻿import { Component, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { TreeNode, MenuItem } from "primeng/primeng";
import { Router } from "@angular/router";

import { EditService } from "../edit/edit.service";
import { WikiService } from "./wiki.service";
import { ApiService } from "../../shared/api.service";
import { ParserService } from "../../shared/parser.service";
import { StatsComponent } from "../stats/stats.component";
import { StatsService } from "../stats/stats.service";
@Component({
  selector: "wiki",
  templateUrl: "./app/story/wiki/wiki.component.html",
  styleUrls: ["./app/story/wiki/wiki.component.css"],
})
export class WikiComponent implements OnInit, AfterViewInit {
  @ViewChild(StatsComponent) stats: StatsComponent;
  private data: any;
  private showAddDialog: any;

  private addContent: any;
  private pageName: any;
  private wikiPage: any;
  private disabled: any;
  private icons: any;
  private wikiPageContent = [];
  private showAddHeadDialog = false;
  private showDeleteDialog = false;
  private toDelete: any;
  private nav: any;

  // adding and deleting pages anc categories
  private allCategories = [];
  private allPages = [];
  private nestedPages = [];
  private defAdd: any;
  private defDel: any;
  private filter: string;
  private rename = false;
  private newName: string;
  private fromLink = true;

  // adding and deleting templates
  private headingName: any;
  private heading: any;
  private exist: boolean;
  private empty = false;
  private type: any;
  private headID: any;

  // context menus
  private contextMenuItems: MenuItem[];
  private renameNode: TreeNode;

  // stats stuff
  private statMode = false;

  // drag
  private dragNode: TreeNode;
  private dragMode = false;
  private dragNodeId: any;
  private mode_title: any;

  constructor(
    private wikiService: WikiService,
    private apiService: ApiService,
    private editService: EditService,
    private parserService: ParserService,
    private statsService: StatsService,
    private router: Router
  ) {}

  ngOnInit() {
    // getting shared data for website
    this.data = this.apiService.data;
    this.nav = this.apiService.data.wikiNav;
    this.filter = "";
    this.data.wikiFuctions.push(this.onTemplateHeadingCallback());

    // check if wiki was loaded before and loads the correct content
    if (
      this.data.selectedEntry &&
      this.data.page !== null &&
      this.data.page.hasOwnProperty("title")
    ) {
      if (this.data.selectedEntry.type === "category") {
        this.wikiService.getWikiSegment(
          this.data.selectedEntry.data.id,
          this.onGetCallback()
        );
      } else if (this.data.selectedEntry.type === "page") {
        this.wikiService.getWikiPage(
          this.data.selectedEntry.data.id,
          this.onGetCallback()
        );
      } else {
        this.wikiPage = null;
        this.apiService.refreshWikiInfo();
      }
    } else {
      this.data.selectedEntry = this.data.wikiNav[0];
    }

    this.updateData();
  }

  ngAfterViewInit() {
    this.calcHeight();
  }

  // parses wiki page
  public parsePage() {
    this.wikiPageContent = [];
    this.wikiPage = this.data.page;

    this.disabled = [true];
    this.icons = ["fa-pencil"];
    this.wikiPageContent.push({
      title: this.wikiPage.title,
      text: "",
    });
    this.toDelete = this.wikiPage.title;
    for (let i = 0; i < this.wikiPage.headings.length; i++) {
      this.disabled.push(true);
      this.icons.push("fa-pencil");
      this.wikiPageContent.push({
        title: this.wikiPage.headings[i].title,
        text: this.wikiPage.headings[i].text,
        active: false,
      });
    }

    this.calcHeight();
  }

  // setting up the context menu for navigation bar based on the type of element clicked
  public setContextMenu(node: any) {
    this.renameNode = node;
    this.rename = false;
    if (node.type === "page") {
      this.contextMenuItems = [
        {
          label: "Rename",
          command: () => {
            this.rename = true;
            this.newName = node.label;
            window.setTimeout(function () {
              const input = <HTMLScriptElement>(
                document.getElementById("newName")
              );
              if (input) {
                document.getElementById("newName").focus();
              }
            }, 0);
          },
        },

        {
          label: "Delete",
          command: () => {
            this.onShow(0);
          },
        },
      ];
    } else if (node.type === "category" || node.type === "title") {
      this.contextMenuItems = [
        {
          label: "Rename",
          command: () => {
            this.rename = true;
            this.newName = node.label;
            window.setTimeout(function () {
              const input = <HTMLScriptElement>(
                document.getElementById("newName")
              );
              if (input) {
                document.getElementById("newName").focus();
              }
            }, 0);
          },
        },
        {
          label: "Add Category",
          command: () => {
            this.onAddPage(0);
          },
        },
        {
          label: "Add Page",
          command: () => {
            this.onAddPage(0);
          },
        },
        {
          label: "Delete",
          command: () => {
            this.onShow(0);
          },
        },
      ];
    }
  }

  // renames elements on the nav bar
  public onRename(node: any, mode: any) {
    if (mode) {
      if (node.type === "category") {
        this.wikiService.editSegment(node.data.id, "set_title", this.newName);
      } else if (node.type === "title") {
        this.wikiService.editWiki(
          this.data.wiki.wiki_id,
          "set_title",
          this.newName
        );
      } else {
        this.wikiService.editPage(node.data.id, "set_title", this.newName);
      }
    } else {
      this.newName = "";
    }
    this.rename = false;
  }

  // Get Page/Segment stuff

  /**
   * Switch between pages for the wiki
   * @param page
   */
  public onSelected(page: any) {
    // Take care of when the title page is clicked
    this.data.selectedEntry = page.node;
    if (!this.statMode) {
      this.rename = false;

      if (page.node.type === "title") {
        this.wikiPage = null;
        this.apiService.refreshWikiInfo();
      } else if (page.node.type === "category") {
        page.node.expanded = !page.node.expanded;
        // get information for the page.
        this.wikiService.getWikiSegment(
          page.node.data.id,
          this.onGetCallback()
        );
        this.heading = "Template Heading";
      } else {
        this.wikiService.getWikiPage(page.node.data.id, this.onGetCallback());
        this.heading = "Heading";
      }
    } else {
      if (page.node.type === "category") {
        page.node.expanded = !page.node.expanded;
      }
      this.stats.showWikiStats();
    }
  }

  /**
   * All adding methods
   */

  public addToWiki(add: boolean) {
    // creating the new node to be added to the navigation

    this.showAddDialog = false;
    this.empty = false;
    if (add) {
      if (this.addContent === "Category") {
        this.wikiService.addSegment(
          this.pageName,
          this.data.selectedEntry.data.id,
          this.onAddCallback()
        );
      } else {
        this.wikiService.addPage(
          this.pageName,
          this.data.selectedEntry.data.id,
          this.onAddCallback()
        );
      }

      // need to send this info over network and get id;
      this.pageName = "";
    }
  }

  /*
    Will toogle value of button variable to indicate whether something needs to be added or not
    */
  public onAddPage(type: any) {
    this.showAddDialog = true;
    this.empty = false;
    if (type === 0) {
      this.addContent = "Category";
    } else {
      this.addContent = "Page";
    }
    this.pageName = "";
    const idx = this.allCategories.findIndex(this.selectedEntry());
    if (idx !== -1) {
      this.defAdd = this.allCategories[idx].value;
    }
  }

  // shows the add heading prompt
  public addHeading() {
    this.headingName = "";
    this.empty = false;
    this.showAddHeadDialog = true;
  }

  // adds the heading and send message to server
  public createHeading(addMore: boolean) {
    if (!addMore) {
      this.showAddHeadDialog = false;
      this.empty = false;
    }

    let temp = {};
    if (this.data.selectedEntry.type === "category") {
      this.wikiService.addTemplateHeading(
        this.headingName,
        this.data.selectedEntry.data.id
      );
    } else {
      this.wikiService.addHeading(
        this.headingName,
        this.data.selectedEntry.data.id
      );
    }
    temp = {
      title: this.headingName,
      text: "",
    };

    this.wikiPage.headings.push(temp);
    temp["active"] = false;
    this.wikiPageContent.push(temp);

    this.onEdit(this.wikiPageContent.length - 1);
    this.disabled.push(true);
    this.icons.push("fa-pencil");
    this.headingName = "";
  }

  // take care of text change for input boxes in the add prompts
  public onTextChange(text: string, mode: boolean) {
    if (!this.empty) {
      this.empty = true;
    }
    this.exist = false;
    if (mode) {
      if (
        this.wikiPageContent.filter((heading) => heading.title === text)
          .length !== 0
      ) {
        this.exist = true;
      }
    } else {
      if (
        this.data.wikiFlatten.filter((ele: any) => ele.label === text)
          .length !== 0
      ) {
        this.exist = true;
      }
    }
  }

  // -----------------------------Editing stuff---------------------------------------------

  // updates the heading content
  public onEdit(idx: any) {
    for (let i = 1; i < this.wikiPageContent.length; i++) {
      this.wikiPageContent[i].active = false;
      const temp = this.wikiPage.headings[i - 1].text;
      this.wikiPage.headings[i - 1].text = "";
      this.wikiPage.headings[i - 1].text = temp;
    }
    this.wikiPageContent[idx].active = true;
    this.onSavePage();
  }

  // takes care of how to update heading titles
  public onDisable(idx: any) {
    let title = "";

    window.setTimeout(function () {
      const input = <HTMLScriptElement>document.getElementById("editable");
      if (input) {
        document.getElementById("editable").focus();
      }
    }, 0);

    // saving the previous state
    if (this.disabled[idx]) {
      this.icons[idx] = "fa-check";
      if (idx === 0) {
        title = this.wikiPage.title;
        this.wikiPageContent[idx]["title"] = title;
      } else {
        title = this.wikiPage.headings[idx - 1].title;
        this.wikiPageContent[idx]["title"] = title;
      }
    } else {
      // need to send the new state to the server
      this.icons[idx] = "fa-pencil";
      if (this.data.selectedEntry.type === "category") {
        // editing the category title
        if (
          idx === 0 &&
          !(this.wikiPageContent[0].title === this.wikiPage.title)
        ) {
          this.wikiService.editSegment(
            this.data.selectedEntry.data.id,
            "set_title",
            this.wikiPage.title
          );
          this.data.selectedEntry.data.title = this.wikiPage.title;
        } else if (
          idx !== 0 &&
          !(this.wikiPageContent[idx].title === this.wikiPage.title)
        ) {
          this.wikiService.editTemplateHeading(
            this.data.selectedEntry.data.id,
            this.wikiPageContent[idx].title,
            "set_title",
            this.wikiPage.headings[idx - 1].title
          );
          // editing template heading
        }
      } else {
        // saving page information
        if (
          idx === 0 &&
          !(this.wikiPageContent[0].title === this.wikiPage.title)
        ) {
          // sending a null response so server closes connection
          this.wikiService.editPage(
            this.data.selectedEntry.data.id,
            "set_title",
            this.wikiPage.title
          );
          this.data.selectedEntry.data.title = this.wikiPage.title;
        } else if (
          idx !== 0 &&
          !(this.wikiPageContent[idx].title === this.wikiPage.title)
        ) {
          this.wikiService.editHeading(
            this.data.selectedEntry.data.id,
            this.wikiPageContent[idx].title,
            "set_title",
            this.wikiPage.headings[idx - 1].title
          );
        }
      }
    }

    this.disabled[idx] = !this.disabled[idx];
  }

  // reset the heading title to previous value
  public onCancel(idx: any) {
    if (idx === 0) {
      this.wikiPage.title = this.wikiPageContent[0].title;
    } else {
      this.wikiPage.headings[idx - 1].title = this.wikiPageContent[idx].title;
    }
    this.disabled[idx] = !this.disabled[idx];
  }

  public editAlias(alias: any) {
    // enable the textbox
    if (alias.state) {
      alias.state = !alias.state;
      alias.icon = "fa-check";
      alias.prev = alias.name;
    } else {
      // disable textbox
      alias.state = !alias.state;
      alias.icon = "fa-pencil";
      if (!(alias.prev === alias.name)) {
        this.wikiService.editAlias(alias.id, alias.name);
      }
      alias.prev = "";
    }
  }

  public cancelAlias(alias: any) {
    alias.name = alias.prev;
    alias.state = true;
  }

  // ----------------------------------Save Methods--------------------------------------------------

  // saves the wiki page content
  public onSavePage() {
    for (let i = 0; i < this.wikiPage.headings.length; i++) {
      if (
        !(this.wikiPageContent[i + 1].text === this.wikiPage.headings[i].text)
      ) {
        this.wikiPageContent[i + 1].text = this.wikiPage.headings[i].text;
        if (this.data.selectedEntry.type === "category") {
          this.wikiService.editTemplateHeading(
            this.data.selectedEntry.data.id,
            this.wikiPage.headings[i].title,
            "set_text",
            this.wikiPage.headings[i].text
          );
        } else {
          this.wikiService.editHeading(
            this.data.selectedEntry.data.id,
            this.wikiPage.headings[i].title,
            "set_text",
            this.wikiPage.headings[i].text
          );
        }
      }
    }
  }

  // -----------------------------------------Delete Methods----------------------------------------------------
  public onShow(id: any, idx?: any) {
    // need take care of the case where nested section is selected but pages in it are not
    // this is set stuff up for deleting page or segment
    this.type = id;
    if (this.type === 0) {
      const index = this.data.wikiFlatten.findIndex(this.selectedEntry());
      if (index !== -1) {
        this.defDel = this.data.wikiFlatten[index].value;
      }
      this.nestedPages = this.convertLabelValueArray(this.defDel);
    } else if (this.type === 1) {
      // this will delete template heading or heading
      this.headID = idx;
      this.defDel = this.wikiPageContent[idx].title;
    }
    this.showDeleteDialog = true;
  }

  // deletes a page and send message
  public onDeletePage(page: any) {
    this.showDeleteDialog = false;
    if (!page) {
      return;
    }
    if (this.data.selectedEntry.type === "category") {
      this.parserService.deleteSegment(
        this.data.wikiNav[0],
        this.data.selectedEntry.data.id
      );
      this.wikiService.deleteSegment(
        this.data.selectedEntry.data.id,
        this.onDeleteCallback()
      );
    } else {
      this.parserService.deletePage(
        this.data.wikiNav[0],
        this.data.selectedEntry.data.id
      );
      this.wikiService.deletePage(
        this.data.selectedEntry.data.id,
        this.onDeleteCallback()
      );
    }
    this.wikiPage = null;
    this.data.page = null;
    this.data.selectedEntry = this.data.wikiNav[0];
  }

  // delete alias

  public deleteAlias(alias: any) {
    this.wikiService.deleteAlias(alias.id);
  }

  // deletes the heading
  public onDeleteHeading(del: any) {
    this.showDeleteDialog = false;
    if (del) {
      if (this.data.selectedEntry.type === "category") {
        this.wikiService.deleteTemplateHeading(
          this.data.selectedEntry.data.id,
          this.defDel
        );
      } else {
        this.wikiService.deleteHeading(
          this.data.selectedEntry.data.id,
          this.defDel
        );
      }
      this.wikiPageContent.splice(this.headID, 1);
      this.wikiPage.headings.splice(this.headID - 1, 1);
    }
  }

  // navigates to editor for specific reference
  public onReference(ref: any) {
    this.data.story.position_context = {
      section_id: ref.section_id,
      paragraph_id: ref.paragraph_id,
    };
    this.apiService.refreshStoryContent(ref.section_id, null);
    this.router.navigate(["/story/edit"]);
  }

  // updates the data for wiki
  public updateData() {
    let ele: TreeNode;
    let temp = [];
    if (this.data.wikiNav) {
      this.data.wikiFlatten = [];
      temp = this.parserService.getTreeArray(this.data.wikiNav[0]);
      for (const idx in temp) {
        if (temp.hasOwnProperty(idx)) {
          ele = temp[idx];
          if (ele.type === "category" || ele.type === "title") {
            this.allCategories.push({ label: ele.label, value: ele });
          } else if (ele.type === "page") {
            this.allPages.push({ label: ele.label, value: ele });
          }

          this.data.wikiFlatten.push({ label: ele.label, value: ele });
        }
      }
      this.statsService.get_page_frequency(
        this.data.story.story_id,
        this.data.wiki.wiki_id
      );
    }
  }

  // Converts out nav bar into an array of MenuItems
  public convertLabelValueArray(node: TreeNode) {
    if (node) {
      const result = [];
      const temp = this.parserService.getTreeArray(node);
      for (const idx in temp) {
        if (temp.hasOwnProperty(idx)) {
          result.push({ label: temp[idx].label, value: temp[idx] });
        }
      }
      return result;
    }
    return [];
  }

  // check if we have a selected entry
  public selectedEntry() {
    return (option: any) => {
      return this.data.selectedEntry.label === option.label;
    };
  }

  // call back for how to handle template header events
  public onTemplateHeadingCallback(): Function {
    return (reply: any) => {
      if (reply.event.includes("heading_added")) {
        const temp = {
          title: reply.title,
          text: "",
        };

        this.wikiPage.headings.push(temp);
        temp["active"] = false;
        this.wikiPageContent.push(temp);

        this.onEdit(this.wikiPageContent.length - 1);
        this.disabled.push(true);
        this.icons.push("fa-pencil");
      } else if (reply.event.includes("heading_updated")) {
        const idx = this.wikiPage.headings.findIndex(
          (ele: any) =>
            ele.title === reply.template_heading_title ||
            ele.title === reply.heading_title
        );
        if (reply.update.update_type === "set_title") {
          this.wikiPage.headings[idx].title = reply.update.title;
          this.wikiPageContent[idx + 1].title = reply.update.title;
        } else {
          this.wikiPage.headings[idx].text = reply.update.text;
          this.wikiPageContent[idx + 1].text = reply.update.text;
        }
      } else if (reply.event.includes("heading_deleted")) {
        const idx = this.wikiPage.headings.findIndex(
          (ele: any) =>
            ele.title === reply.template_heading_title ||
            ele.title === reply.heading_title
        );
        if (idx !== -1) {
          this.wikiPageContent.splice(idx, 1);
          this.wikiPage.headings.splice(idx - 1, 1);
        }
      } else {
      }
    };
  }

  // handles add events
  public onAddCallback(): Function {
    return (reply: any) => {
      if (reply.event === "segment_added") {
        // this.data.selectedEntry = this.parserService.findSegment(this.data.wikiNav[0],reply.segment_id);
        this.wikiService.getWikiSegment(reply.segment_id, this.onGetCallback());
      } else if (reply.event === "page_added") {
        // this.data.selectedEntry = this.parserService.findPage(this.data.wikiNav[0], reply.page_id);
        this.wikiService.getWikiPage(reply.page_id, this.onGetCallback());
      }
      this.parserService.expandPath(this.data.selectedEntry);
      this.updateData();
    };
  }

  // handles the delete events
  public onDeleteCallback(): Function {
    return (reply: any) => {
      this.updateData();
    };
  }

  // handles the get events
  public onGetCallback(): Function {
    return (reply: any) => {
      this.wikiPageContent = [];
      this.wikiPage = this.data.page;

      this.disabled = [true];
      this.icons = ["fa-pencil"];
      this.wikiPageContent.push({
        title: this.wikiPage.title,
        text: "",
      });
      this.toDelete = this.wikiPage.title;
      for (let i = 0; i < this.wikiPage.headings.length; i++) {
        this.disabled.push(true);
        this.icons.push("fa-pencil");
        this.wikiPageContent.push({
          title: this.wikiPage.headings[i].title,
          text: this.wikiPage.headings[i].text,
          active: false,
        });
      }
      this.fromLink = false;

      this.calcHeight();
    };
  }

  // calculates the height of the wiki page
  public calcHeight() {
    setTimeout(() => {
      const wiki_ele = <HTMLScriptElement>(
        document.getElementsByClassName("wiki")[0]
      );
      const header = <HTMLScriptElement>(
        document.getElementsByClassName(
          "ui-editor-toolbar ui-widget-header ui-corner-top ql-toolbar ql-snow"
        )[0]
      );
      const header_ele = <HTMLScriptElement>(
        document.getElementsByClassName("header")[0]
      );
      let page_content_height: any;
      if (header_ele) {
        page_content_height = wiki_ele.offsetHeight - header_ele.offsetHeight;
      } else {
        if (header) {
          page_content_height = wiki_ele.offsetHeight - header.offsetHeight;
        }
      }
      const div = <HTMLScriptElement>document.getElementById("page_content");
      if (div) {
        div.style.height = page_content_height + "px";
      }
    }, 10);
  }

  // On drag stuff
  public nodeDrag(node) {
    if (node.parent) {
      this.dragNode = node;
      this.dragMode = true;
      this.mode_title = "Drag Mode Activated";
    }
    console.log("starting drag");
  }

  public endDrag() {
    this.dragNode = null;
    this.dragMode = false;
    this.dragNodeId = null;
    console.log("end drag");
  }

  public nodeDrop(node) {
    /*
            Case 1: page -> category
            Case 2: page -> page
            Case 3: category -> category (inside)
            Case 4: category -> around category
        */
    if (this.dragNode && node !== this.dragNode) {
      if (
        (node.parent && node.parent === this.dragNode) ||
        this.dragNode.type === "title"
      ) {
        //    console.log("moving parent into child");
        // show error message
        return;
      } else if (node.type === "page" && this.dragNode.type === "page") {
        const rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
        this.dragNode.parent.children.splice(rmidx, 1);
        // index of draged to node
        const idx = node.parent.children.indexOf(node);

        node.parent.children.splice(idx + 1, 0, this.dragNode);
        this.dragNode.parent = node.parent;
        //  console.log("Moving: " + this.dragNode.label + " after " + node.label + "at index " + (idx + 1));
        this.wikiService.move_page(
          this.dragNode.data.id,
          this.dragNode.parent.data.id,
          idx + 1
        );
      } else if (node.type === "category" && this.dragNode.type === "page") {
        // remove from current location

        const rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
        this.dragNode.parent.children.splice(rmidx, 1);

        // adding it to the top
        const idx = this.parserService.firstPage(node);
        node.children.splice(idx, 0, this.dragNode);
        this.dragNode.parent = node;
        // console.log("Moving: " + this.dragNode.label + " into " + node.label + "at index " + (idx));
        this.wikiService.move_page(
          this.dragNode.data.id,
          this.dragNode.parent.data.id,
          idx
        );
      } else if (
        node.type === "category" &&
        this.dragNode.type === "category"
      ) {
        if (node.expanded) {
          const rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
          this.dragNode.parent.children.splice(rmidx, 1);
          // index of draged to node
          node.children.splice(0, 0, this.dragNode);
          this.dragNode.parent = node;
          //                        console.log("Moving: " + this.dragNode.label + " into " + node.label + "at index " + (idx));

          this.wikiService.move_segment(
            this.dragNode.data.id,
            this.dragNode.parent.data.id,
            0
          );
        } else {
          const rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
          this.dragNode.parent.children.splice(rmidx, 1);
          // index of draged to node
          const idx = node.parent.children.indexOf(node);

          node.parent.children.splice(idx + 1, 0, this.dragNode);
          this.dragNode.parent = node.parent;
          //   console.log("Moving: " + this.dragNode.label + " after " + node.label + "at index " + (idx+1));

          this.wikiService.move_segment(
            this.dragNode.data.id,
            this.dragNode.parent.data.id,
            idx + 1
          );
        }
      } else if (node.type === "title") {
        // need to do move locally
        const rmidx = this.dragNode.parent.children.indexOf(this.dragNode);
        this.dragNode.parent.children.splice(rmidx, 1);
        this.dragNode.parent = node;
        if (this.dragNode.type === "category") {
          node.children.splice(0, 0, this.dragNode);
          this.wikiService.move_segment(this.dragNode.data.id, node.data.id, 0);
        } else {
          const idx = this.parserService.firstPage(node);
          node.children.splice(idx, 0, this.dragNode);
          this.wikiService.move_page(
            this.dragNode.data.id,
            node.data.id,
            node.children.length + 1
          );
        }
      }
    }
    // console.log("dropping " + node.label);

    this.endDrag();
  }

  public nodeDragEnter(node) {
    if (this.dragNode && this.dragNode !== node) {
      // console.log("entering " + node.label);
      if (this.dragNode.type === "page" && node.type === "category") {
        node.expanded = true;
      }
      if (
        (this.dragNode.type === "category" && node.type !== "page") ||
        this.dragNode.type === "page"
      ) {
        this.dragNodeId = node.data.id;
      }
    }
  }

  // takes care of the stats overlay
  public onStats() {
    if (!this.statMode) {
      if (this.data.selectedEntry.type === "category") {
        this.wikiService.getWikiSegment(
          this.data.selectedEntry.data.id,
          this.onGetCallback()
        );
      } else {
        this.wikiService.getWikiPage(
          this.data.selectedEntry.data.id,
          this.onGetCallback()
        );
      }
    } else {
      this.mode_title = "Stats Mode Activated";
    }
  }
}
