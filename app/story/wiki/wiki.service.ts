import { Injectable } from "@angular/core";

import { ApiService } from "../../shared/api.service";

@Injectable()
export class WikiService {
  constructor(private apiService: ApiService) {}
  // Move calls

  public move_segment(sid: any, to_pid: any, to_idx: any) {
    this.apiService.send({
      action: "move_segment",
      segment_id: sid,
      to_parent_id: to_pid,
      to_index: to_idx,
    });
  }

  public move_template_heading(sid: any, title: any, to_idx: any) {
    this.apiService.send({
      action: "move_segment",
      segment_id: sid,
      template_heading_title: title,
      to_index: to_idx,
    });
  }

  public move_page(pid: any, to_pid: any, to_idx: any) {
    this.apiService.send({
      action: "move_page",
      page_id: pid,
      to_parent_id: to_pid,
      to_index: to_idx,
    });
  }

  public move_heading(sid: any, title: any, to_idx: any) {
    this.apiService.send({
      action: "move_segment",
      page_id: sid,
      heading_title: title,
      to_index: to_idx,
    });
  }

  // GET Calls

  public getWikiSegmentHierarchy(
    segment_id: any,
    callback: Function = () => {}
  ) {
    this.apiService.send(
      {
        action: "get_wiki_segment_hierarchy",
        segment_id: segment_id,
      },
      callback
    );
  }

  public getWikiSegment(sid: any, callback: Function = () => {}) {
    this.apiService.send(
      {
        action: "get_wiki_segment",
        segment_id: sid,
      },
      callback
    );
  }
  public getWikiPage(
    page_id: any,
    callback: Function = () => {},
    metadata: any = {}
  ) {
    this.apiService.send(
      {
        action: "get_wiki_page",
        page_id: page_id,
      },
      callback,
      metadata
    );
  }

  public getWikiAliasList() {
    this.apiService.send({
      action: "get_wiki_alias_list",
    });
  }

  // EDITS
  public editWiki(wiki_id: any, u_type: any, text: any) {
    this.apiService.send({
      action: "edit_wiki",
      wiki_id: wiki_id,
      update: {
        update_type: u_type,
        title: text,
      },
    });
  }
  // update type: set_title;
  public editSegment(segment_id: any, update_type: string, new_text: string) {
    this.apiService.send({
      action: "edit_segment",
      segment_id: segment_id,
      update: {
        update_type: "set_title",
        title: new_text,
      },
    });
  }

  public editPage(page_id: any, update_type: string, new_text: string) {
    this.apiService.send({
      action: "edit_page",
      page_id: page_id,
      update: {
        update_type: update_type,
        title: new_text,
      },
    });
  }

  // update_type: {"set_title" | "set_text"

  public editHeading(
    page_id: any,
    heading_title: string,
    update_type: string,
    new_text: string
  ) {
    if (update_type === "set_text") {
      this.apiService.send({
        action: "edit_heading",
        page_id: page_id,
        heading_title: heading_title,
        update: {
          update_type: update_type,
          text: new_text,
        },
      });
    } else {
      this.apiService.send({
        action: "edit_heading",
        page_id: page_id,
        heading_title: heading_title,
        update: {
          update_type: update_type,
          title: new_text,
        },
      });
    }
  }

  public editAlias(aid: any, nName: any) {
    this.apiService.send({
      action: "change_alias_name",
      alias_id: aid,
      new_name: nName,
    });
  }

  public editTemplateHeading(sid: any, title: any, type: any, nTitle: any) {
    if (type === "set_title") {
      this.apiService.send({
        action: "edit_template_heading",
        segment_id: sid,
        template_heading_title: title,
        update: {
          update_type: type,
          title: nTitle,
        },
      });
    } else {
      this.apiService.send({
        action: "edit_template_heading",
        segment_id: sid,
        template_heading_title: title,
        update: {
          update_type: type,
          text: nTitle,
        },
      });
    }
  }
  // ADD
  public addSegment(title: string, pid: any, callback: Function = () => {}) {
    this.apiService.send(
      {
        action: "add_segment",
        title: title,
        parent_id: pid,
      },
      callback
    );
  }

  public addTemplateHeading(title: string, sid: any) {
    this.apiService.send({
      action: "add_template_heading",
      title: title,
      segment_id: sid,
    });
  }

  // parent_id === segment_id
  public addPage(title: string, sid: any, callback: Function = () => {}) {
    this.apiService.send(
      {
        action: "add_page",
        title: title,
        parent_id: sid,
      },
      callback
    );
  }

  public addHeading(title: string, page_id: any) {
    this.apiService.send({
      action: "add_heading",
      title: title,
      page_id: page_id,
    });
  }

  // Delete
  public deleteSegment(sid: any, callback: Function = () => {}) {
    this.apiService.send(
      {
        action: "delete_segment",
        segment_id: sid,
      },
      callback
    );
  }

  public deletePage(pid: any, callback: Function = () => {}) {
    this.apiService.send(
      {
        action: "delete_page",
        page_id: pid,
      },
      callback
    );
  }

  public deleteHeading(pid: any, title: any) {
    this.apiService.send({
      action: "delete_heading",
      page_id: pid,
      heading_title: title,
    });
  }

  public deleteAlias(aid: any) {
    this.apiService.send({
      action: "delete_alias",
      alias_id: aid,
    });
  }

  public deleteTemplateHeading(sid: any, title: any) {
    this.apiService.send({
      action: "delete_template_heading",
      segment_id: sid,
      template_heading_title: title,
    });
  }
  // CREATES
  public createWiki(
    title: string,
    summary: string,
    callback: Function = () => {}
  ) {
    this.apiService.send(
      {
        action: "create_wiki",
        title: title,
        summary: summary,
      },
      callback
    );
  }
}
