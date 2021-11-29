import { Component, OnInit } from "@angular/core";
import { Router, NavigationStart, Event } from "@angular/router";

import { MenuItem } from "primeng/primeng";
import { ApiService } from "../shared/api.service";
import { ParserService } from "../shared/parser.service";

import { StoryService } from "./story.service";

@Component({
  selector: "story",
  templateUrl: "./app/story/story.component.html",
  styleUrls: ["./app/story/story.component.css"],
})
export class StoryComponent implements OnInit {
  private data: any;
  private items: MenuItem[];
  private activeItem: MenuItem;

  // Editing the title
  private editing: boolean;
  private prevTitle: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private storyService: StoryService,
    private parserService: ParserService
  ) {}

  ngOnInit() {
    this.data = this.apiService.data;

    // Edit and Notebook tabs
    this.items = [
      {
        label: "",
        disabled: true,
        icon: "fa-pencil-square-o",
        routerLink: ["/story/edit"],
        command: (event: any) => {
          this.apiService.refreshStoryContent();
        },
      },
      {
        label: "",
        disabled: true,
        icon: "fa-book",
        routerLink: ["/story/wiki"],
      },
    ];
    this.activeItem = this.items[0];

    // This changes the navigation bar highlight
    this.router.events
      .filter((event: Event) => event instanceof NavigationStart)
      .subscribe((event: Event) => {
        if (event.url === "/story/edit") {
          this.activeItem = this.items[0];
        } else if (event.url === "/story/wiki") {
          this.activeItem = this.items[1];
        }
      });

    this.data.storyFunction = this.disableMenu();
  }

  // Menu should be disabled until wiki is established
  public disableMenu(): Function {
    return (reply: any) => {
      for (const item of this.items) {
        item["disabled"] = false;
      }
      delete this.data.storyFunction;
    };
  }

  // Editing the story title
  public edit() {
    this.editing = true;
    this.prevTitle = this.data.story.story_title;
  }
  public save() {
    this.editing = false;
    this.storyService.editStory(
      this.data.story.story_id,
      this.data.story.story_title
    );
  }
  public cancel() {
    this.editing = false;
    this.data.story.story_title = this.prevTitle;
  }
}
