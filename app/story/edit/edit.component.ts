﻿import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";

import { Editor, TreeNode, MenuItem } from "primeng/primeng";
import { StoryService } from "../story.service";
import { EditService } from "./edit.service";
import { WikiService } from "../wiki/wiki.service";
import { UserService } from "../../user/user.service";
import { ApiService } from "../../shared/api.service";
import { ParserService } from "../../shared/parser.service";

import { ID } from "../../models/id.model";
import { Alias } from "../../models/link/alias.model";
import { PassiveLink } from "../../models/link/passive-link.model";

import { StatsComponent } from "../stats/stats.component";

declare var Quill: any;

@Component({
  selector: "edit",
  templateUrl: "./app/story/edit/edit.component.html",
  styleUrls: ["./app/story/edit/edit.component.css"],
})
export class EditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(Editor) editor: Editor;
  @ViewChild(StatsComponent) stats: StatsComponent;
  private data: any;
  private editorRef: any;
  private wordCount: number;
  private paragraphPosition: ID;
  private saveNeeded: boolean;

  // Dialogs
  private displayLinkCreator: boolean;
  private displaySectionCreator: boolean;
  private displaySectionDeleter: boolean;
  private displayBookmarkCreator: boolean;
  private displayBookmarkDeleter: boolean;

  // Creating links
  private range: any;
  private word: string;
  private newLinkID: ID;
  private newLinkPages: any;
  private newSegmentID: ID;
  private newSegments: any;
  private passiveLinkID: ID;
  private insertIndex: number;

  // Adding/editing sections
  private renaming: boolean;
  private newSectionTitle: string;
  private contextMenuItems: MenuItem[];
  private moveSection: TreeNode;
  private dragNodeID: ID = new ID();

  // Bookmarks
  private bookmark: TreeNode = { data: {} };
  private oldBookmark: TreeNode;
  private newBookmark: any = {};
  private bookmarkRenaming: boolean;

  private suggest: any = {};
  private predict = "";
  private note: any = { display: "none" };
  private noteEditing = false;

  // Stats
  private statMode = false;
  constructor(
    private router: Router,
    private storyService: StoryService,
    private editService: EditService,
    private wikiService: WikiService,
    private userService: UserService,
    private apiService: ApiService,
    private parserService: ParserService
  ) {}

  ngOnInit() {
    this.data = this.apiService.data;
    this.data.tooltip.display = "none";

    if (!this.apiService.messages) {
      this.router.navigate(["/login"]);
    }
    window.onbeforeunload = () => {
      this.save();
    };
  }

  ngAfterViewInit() {
    // Initialize variables
    this.editorRef =
      this.editor.el.nativeElement.querySelector("div.ql-editor");

    // Add click event handlers to links when necessary
    this.editor.onSelectionChange.subscribe((event: any) => {
      const idx = this.editor.quill.getSelection();
      if (idx) {
        const blot = this.editor.quill.getLine(idx.index);
        if (blot) {
          let block = blot[0];
          while (block && block.domNode && !block.domNode.id && block.parent) {
            block = block.parent;
          }
          if (block && block.domNode && block.domNode.id) {
            this.paragraphPosition = { $oid: block.domNode.id };
          }
        }
      }
    });

    // Called on any change in the editor
    this.editor.onTextChange.subscribe((editorEvent: any) => {
      if (editorEvent.delta.ops[1] && editorEvent.delta.ops[1].delete) {
        this.saveNeeded = true;
      }

      // Set the position in the editor if there is a position context
      if (this.data.story.position_context) {
        if (this.data.story.position_context.paragraph_id) {
          if (
            this.scrollToParagraph(
              this.data.story.position_context.paragraph_id.$oid
            )
          ) {
            this.data.story.position_context = null;
          }
        } else if (this.data.story.position_context.cursor) {
          const node = document.getElementById(
            this.data.story.position_context.cursor
          );
          if (node) {
            const blot = Quill["find"](node);
            if (blot) {
              const idx = this.editor.quill.getIndex(blot);
              if (idx) {
                const offset: number =
                  node.innerText === "\n" ? 0 : node.innerText.length;
                this.editor.quill.setSelection(idx + offset, 0);
                this.data.story.position_context = null;
              }
            }
          }
        }
      }

      this.suggest.display = "none";
      if (editorEvent.delta.ops[0] && editorEvent.delta.ops[1]) {
        const index: number = editorEvent.delta.ops[0].retain;
        const insert: string = editorEvent.delta.ops[1].insert;
        const deleted: number = editorEvent.delta.ops[1].delete;

        if (index && (insert || deleted)) {
          // Update the current state of the prediction
          if (this.predict && insert) {
            this.predict += insert;
          } else if (this.predict && deleted) {
            this.predict = this.predict.substring(
              0,
              this.predict.length - deleted
            );
          } else {
            const text: string = this.editor.quill.getText(0, index + 1);
            this.predict = text.slice(text.lastIndexOf("\n") + 1);
            this.predict = this.predict.slice(
              this.predict.lastIndexOf(" ") + 1
            );
            this.insertIndex = index - (this.predict.length - 1);
          }

          if (this.predict) {
            let valIndex = 0;
            const bounds = this.editor.quill.getBounds(index);
            const top: number = bounds.top + 200;

            // Loop through the aliases (TODO: implement a TRIE to improve)
            for (const aliasID in this.data.aliasTable) {
              if (this.data.aliasTable.hasOwnProperty(aliasID)) {
                const alias: Alias = this.data.aliasTable[aliasID];

                // Look for aliases that start with the prediction string
                if (alias.alias_name.startsWith(this.predict)) {
                  if (this.suggest.display === "none") {
                    this.suggest = {
                      options: [
                        {
                          label: alias.alias_name,
                          value: {
                            title: alias.alias_name,
                            page_id: alias.page_id,
                            index: valIndex++,
                          },
                        },
                      ],
                      display: "block",
                      top: top + "px",
                      left: bounds.left + "px",
                    };
                    this.suggest.value = this.suggest.options[0].value;
                  } else {
                    this.suggest.options.push({
                      label: alias.alias_name,
                      value: {
                        title: alias.alias_name,
                        page_id: alias.page_id,
                        index: valIndex++,
                      },
                    });
                  }
                }
              }
            }
            if (this.suggest.display === "none") {
              this.predict = "";
            }
          }
        } else {
          this.predict = "";
        }
      }

      // Set the click event of each link
      const threads: any[] = this.editorRef.querySelectorAll("a[href]");
      for (const thread of threads) {
        if (!thread.onclick) {
          const linkID: string = thread.getAttribute("href");
          const ids: string[] = linkID.split("-");
          const pageID: ID = { $oid: ids[1] };

          if (ids[2]) {
            // Passive link
            thread.id = ids[2];
            if (ids[2] === "true") {
              thread.onclick = (event: any) => {
                event.preventDefault();
                if (this.data.tooltip.display === "block") {
                  this.data.tooltip.display = "none";
                } else {
                  this.passiveLinkID = { $oid: ids[0] };
                  const passiveLink: PassiveLink =
                    this.data.passiveLinkTable[
                      JSON.stringify(this.passiveLinkID)
                    ];
                  if (passiveLink) {
                    const alias: Alias =
                      this.data.aliasTable[
                        JSON.stringify(passiveLink.alias_id)
                      ];
                    if (alias) {
                      const aBlot = Quill["find"](event.target);
                      const index: number = this.editor.quill.getIndex(aBlot);
                      const bounds: any = this.editor.quill.getBounds(index);
                      const top: number = bounds.top + 200;

                      this.data.tooltip = {
                        passive: true,
                        display: "block",
                        top: top + "px",
                        left: bounds.left + "px",
                      };
                      this.loopPages(
                        this,
                        this.data.wikiNav[0],
                        (page: TreeNode) => {
                          if (
                            JSON.stringify(alias.page_id) ===
                            JSON.stringify(page.data.id)
                          ) {
                            this.data.tooltip.text =
                              "We suggest linking to " + page.data.title;
                          }
                        },
                        (segment: TreeNode) => {}
                      );
                    }
                  }
                }
              };
            }
          } else {
            // Active link
            thread.onclick = (event: any) => {
              event.preventDefault();
              this.wikiService.getWikiPage(
                pageID,
                () => {
                  this.router.navigate(["story/wiki"]);
                },
                { page_id: pageID, load: true }
              );
              // this.router.navigate(['/story/wiki']);
            };

            // Hover tooltip for links
            thread.onmouseenter = (event: any) => {
              const aBlot = Quill["find"](event.target);
              const index: number = this.editor.quill.getIndex(aBlot);
              const bounds: any = this.editor.quill.getBounds(index);

              const top: number = bounds.top + 200;
              this.data.tooltip = {
                text: "",
                passive: false,
                display: "block",
                top: top + "px",
                left: bounds.left + "px",
              };
              this.wikiService.getWikiPage(pageID);
            };
            thread.onmouseleave = (event: any) => {
              this.data.tooltip.display = "none";
            };
          }
        }
      }

      // Add click events for the notes
      const notes: any[] = this.editorRef.querySelectorAll("code");
      for (const note of notes) {
        if (!note.onclick) {
          note.onclick = (event: any) => {
            if (this.note.display === "block") {
              this.note.display = "none";
            } else {
              const cBlot = Quill["find"](event.target);
              const index: number = this.editor.quill.getIndex(cBlot);
              const bounds: any = this.editor.quill.getBounds(index);

              const top: number = bounds.top + 200;
              this.note = {
                text: event.target.innerHTML,
                index: index,
                length: event.target.innerHTML.length,
                display: "block",
                top: top + "px",
                left: bounds.left + "px",
              };
            }
          };
        }
      }
      this.wordCount = editorEvent.textValue.split(/\s+/).length;
    });
    this.setHotkey(this);
  }

  ngOnDestroy() {
    this.save();
  }

  public keyUp(event: any) {
    // Save on every enter
    if (
      event.key === "Enter" &&
      this.suggest.display !== "block" &&
      !this.noteEditing
    ) {
      const idx = this.editor.quill.getSelection();
      if (idx) {
        const blot = this.editor.quill.getLine(idx.index);
        if (blot) {
          let block = blot[0];
          while (block && block.domNode && !block.domNode.id && block.parent) {
            block = block.parent;
          }
          if (block && block.domNode && block.domNode.id) {
            block.domNode.id = "new";
          }
        }
      }
      this.save(false, false);
    }
  }

  public setHotkey(editComp: EditComponent) {
    setTimeout(() => {
      if (editComp.editor.quill) {
        editComp.editor.quill.keyboard.bindings["9"].unshift({
          handler: (range, context) => {
            if (editComp.suggest.display === "block") {
              editComp.suggest.display = "none";
              editComp.word = editComp.suggest.value.title;
              editComp.newLinkID = editComp.suggest.value.page_id;
              editComp.range = {
                index: editComp.insertIndex,
                length: editComp.predict.length,
              };
              editComp.createLink();
              editComp.editor.quill.insertText(
                editComp.insertIndex + editComp.word.length,
                " ",
                "link",
                false
              );
              editComp.editor.quill.setSelection(
                editComp.insertIndex + editComp.word.length + 1,
                0
              );
              return false;
            } else {
              return true;
            }
          },
          key: 9,
        });
        editComp.editor.quill.keyboard.bindings["13"].unshift({
          handler: (range, context) => {
            if (editComp.suggest.display === "block") {
              editComp.suggest.display = "none";
              editComp.word = editComp.suggest.value.title;
              editComp.newLinkID = editComp.suggest.value.page_id;
              editComp.range = {
                index: editComp.insertIndex,
                length: editComp.predict.length,
              };
              editComp.createLink();
              editComp.editor.quill.insertText(
                editComp.insertIndex + editComp.word.length,
                " ",
                "link",
                false
              );
              editComp.editor.quill.setSelection(
                editComp.insertIndex + editComp.word.length + 1,
                0
              );
              return false;
            } else if (editComp.noteEditing) {
              return false;
            } else {
              return true;
            }
          },
          key: 13,
        });

        // Shortcut for linking
        editComp.editor.quill.keyboard.addBinding(
          {
            key: "L",
            altKey: true,
          },
          (range, context) => {
            editComp.openLinkCreator(editComp);
          }
        );

        // If IntelliSense is active, move around possible suggestions
        editComp.editor.quill.keyboard.addBinding(
          {
            key: "up",
          },
          (range, context) => {
            if (editComp.suggest.display === "block") {
              let index: number = editComp.suggest.value.index;
              if (index > 0) {
                editComp.suggest.value =
                  editComp.suggest.options[--index].value;
              }
              return false;
            } else {
              return true;
            }
          }
        );
        editComp.editor.quill.keyboard.addBinding(
          {
            key: "down",
          },
          (range, context) => {
            if (editComp.suggest.display === "block") {
              let index: number = editComp.suggest.value.index;
              if (index < editComp.suggest.options.length - 1) {
                editComp.suggest.value =
                  editComp.suggest.options[++index].value;
              }
              return false;
            } else {
              return true;
            }
          }
        );
      } else {
        editComp.setHotkey(editComp);
      }
    }, 500);
  }

  /* ------------------------- Open Dialogs ------------------------- */
  public openLinkCreator(editor: EditComponent) {
    if (!editor) {
      editor = this;
    }

    editor.range = editor.editor.quill.getSelection();
    if (editor.range) {
      // Set the range and display the link creator
      editor.word = editor.editor.quill.getText(
        editor.range.index,
        editor.range.length
      );
      editor.range.index += editor.word.search(/\S|$/);
      editor.word = editor.word.trim();
      editor.range.length = editor.word.length;

      // Set the wiki pages in the dropdown
      editor.newLinkPages = [{ label: "Create New Page", value: null }];
      editor.newSegments = [];
      editor.loopPages(
        editor,
        editor.data.wikiNav[0],
        (page: TreeNode) => {
          editor.newLinkPages.push({
            label: page.data.title,
            value: page.data.id,
          });
        },
        (seg: TreeNode) => {
          editor.newSegments.push({
            label: seg.data.title,
            value: seg.data.id,
          });
        }
      );
      editor.newLinkID = editor.newLinkPages[0].value;
      editor.newSegmentID = editor.newSegments[0].value;

      editor.displayLinkCreator = true;
    }
  }
  public openSectionCreator() {
    this.newSectionTitle = "";
    this.displaySectionCreator = true;
  }
  public openSectionRenamer() {
    this.renaming = true;
    this.newSectionTitle = this.data.section.data.title;
  }
  public openBookmarkCreator() {
    const idx = this.editor.quill.getSelection(true);
    if (idx) {
      const blot = this.editor.quill.getLine(idx.index);
      if (blot) {
        let block = blot[0];
        while (block && block.domNode && !block.domNode.id && block.parent) {
          block = block.parent;
        }
        if (block && block.domNode && block.domNode.id) {
          this.displayBookmarkCreator = true;
          this.newBookmark.name = "";
          this.newBookmark.paragraphID = { $oid: block.domNode.id };
        }
      }
    }
  }
  public openBookmarkRenamer() {
    this.bookmarkRenaming = true;
    this.newBookmark.name = this.bookmark.data.name;
  }

  // Link
  public createLink() {
    this.word = this.word.trim();
    if (this.newLinkID) {
      this.editor.quill.deleteText(this.range.index, this.range.length);

      this.editor.quill.insertText(
        this.range.index,
        this.word,
        "link",
        "new" + Math.random() + "-" + this.newLinkID.$oid
      );
      this.editor.quill.setSelection(this.range.index + this.word.length, 0);
      this.displayLinkCreator = false;
    } else {
      this.wikiService.addPage(this.word, this.newSegmentID, (reply: any) => {
        this.newLinkID = reply.page_id;
        this.createLink();
      });
    }
  }

  // Passive links
  public approvePassive() {
    if (this.saveNeeded) {
      this.save(false, false);
      this.saveNeeded = false;
    }
    this.storyService.approvePassiveLink(this.passiveLinkID);
    this.data.tooltip.display = "none";
  }
  public rejectPassive() {
    if (this.saveNeeded) {
      this.save(false, false);
      this.saveNeeded = false;
    }
    this.storyService.rejectPassiveLink(this.passiveLinkID);
    this.data.tooltip.display = "none";
  }

  // Section
  public switchStats(event: any) {
    if (event.checked) {
      this.save();
    } else {
      this.apiService.refreshStoryContent();
    }
  }

  public selectSection(event: any) {
    this.data.section = event.node;
    this.renaming = false;
    this.note.display = "none";
    this.data.tooltip.display = "none";
    this.suggest.display = "none";
    if (this.statMode) {
      this.stats.getSectionStats();
    } else {
      this.save();
      this.apiService.refreshStoryContent(
        event.node.data.section_id,
        event.node.data.title
      );
    }
    this.data.prevSection = event.node;
  }
  public addSection() {
    this.displaySectionCreator = false;
    this.editService.addSection(
      this.data.section.data.section_id,
      this.newSectionTitle
    );
  }
  public renameStory(event: any) {
    this.renaming = false;
    event.stopPropagation();
    this.storyService.editStory(this.data.story.story_id, this.newSectionTitle);
  }
  public renameSection(event: any) {
    this.renaming = false;
    event.stopPropagation();
    this.editService.editSectionTitle(
      this.data.section.data.section_id,
      this.newSectionTitle
    );
  }
  public cancelRenameSection(event: any) {
    this.renaming = false;
    event.stopPropagation();
  }
  public deleteSection() {
    this.displaySectionDeleter = false;
    this.editService.deleteSection(this.data.section.data.section_id);
    this.selectSection({ node: this.data.section.parent });
  }

  // Bookmark
  public selectBookmark(event: any) {
    if (event.node.data.section_id) {
      this.bookmark = event.node;
      this.bookmarkRenaming = false;
      const bookmark: any = event.node.data;
      if (
        JSON.stringify(this.data.section.data.section_id) ===
        JSON.stringify(bookmark.section_id)
      ) {
        this.scrollToParagraph(bookmark.paragraph_id.$oid);
      } else {
        this.data.story.position_context = {
          section_id: bookmark.section_id,
          paragraph_id: bookmark.paragraph_id,
        };
        this.apiService.refreshStoryContent(bookmark.section_id, null);
      }
    } else {
      this.oldBookmark = this.bookmark;
    }
  }
  public addBookmark() {
    this.displayBookmarkCreator = false;
    this.editService.addBookmark(
      this.data.section.data.section_id,
      this.newBookmark.paragraphID,
      this.newBookmark.name,
      this.bookmark.data.index + 1
    );
  }
  public renameBookmark(event: any) {
    event.stopPropagation();
    this.bookmarkRenaming = false;
    this.editService.editBookmark(
      this.bookmark.data.bookmark_id,
      this.newBookmark.name
    );
  }
  public cancelRenameBookmark(event: any) {
    event.stopPropagation();
    this.bookmarkRenaming = false;
  }
  public deleteBookmark() {
    this.displayBookmarkDeleter = false;
    this.editService.deleteBookmark(this.bookmark.data.bookmark_id);
  }

  // -------------------- Other -------------------- //
  public loopPages(
    editor: EditComponent,
    segment: TreeNode,
    func: (page: TreeNode) => any,
    sFunc: (s: TreeNode) => any
  ) {
    if (segment.type === "page") {
      func(segment);
    } else {
      sFunc(segment);
      if (segment.children) {
        for (const seg of segment.children) {
          editor.loopPages(editor, seg, func, sFunc);
        }
      }
    }
  }

  // Set the context menu for right-clicking on menu items
  public setContextMenu(node: TreeNode) {
    this.selectSection({ node: node });
    if (node.parent) {
      this.contextMenuItems = [
        {
          label: "Rename Section",
          command: () => {
            this.openSectionRenamer();
          },
        },
        {
          label: "Delete Section",
          command: () => {
            this.displaySectionDeleter = true;
          },
        },
      ];
    } else {
      this.contextMenuItems = [
        {
          label: "Rename Story",
          command: () => {
            this.openSectionRenamer();
          },
        },
      ];
    }
    this.contextMenuItems.unshift({
      label: "Add Subsection",
      command: () => {
        this.openSectionCreator();
      },
    });
  }

  public scrollToParagraph(paragraphID: string): boolean {
    const paragraph: any = document.getElementById(paragraphID);

    if (paragraph) {
      paragraph.scrollIntoView();
      window.scrollBy(0, -10000);
      paragraph.animate(
        {
          background: ["lightyellow", "white"],
          easing: "ease",
        },
        5000
      );
      return true;
    } else {
      return false;
    }
  }

  public addNote() {
    let idx = this.editor.quill.getSelection(true);
    if (idx) {
      const blot = this.editor.quill.getLine(idx.index);
      if (blot) {
        let block = blot[0];
        while (block && block.domNode && !block.domNode.id && block.parent) {
          block = block.parent;
        }
        if (block && block.domNode && block.domNode.id) {
          idx = this.editor.quill.getIndex(block);
          this.editor.quill.insertText(idx, " ", "code", " ");
          const bounds = this.editor.quill.getBounds(idx);
          const top: number = bounds.top + 200;
          this.note = {
            text: "",
            index: idx,
            length: 0,
            display: "block",
            top: top + "px",
            left: bounds.left + "px",
          };
          this.noteEditing = true;
        }
      }
    }
  }

  public saveNote() {
    this.noteEditing = false;
    this.editor.quill.deleteText(this.note.index, this.note.length);
    this.editor.quill.insertText(this.note.index, this.note.text, "code", " ");
    this.note.display = "none";
    this.save(false, false);
  }

  // Save the current state of the editor
  public save(refresh: boolean = false, setPosition: boolean = true) {
    if (this.data.storyDisplay && this.data.prevSection.data) {
      if (setPosition) {
        this.data.story.position_context = {
          section_id: this.data.prevSection.data.section_id,
          paragraph_id: this.paragraphPosition,
        };
        this.userService.setUserStoryPositionContext(
          this.data.prevSection.data.section_id,
          this.paragraphPosition
        );
      }

      // Get all of the paragraphs, parse them into a paragraph content object
      const header: any = this.editorRef.querySelector("h1");
      const paragraphs: any = this.editorRef.querySelectorAll("p");
      if (paragraphs && paragraphs.length > 0) {
        const newContentObject: any = this.parserService.parseHtml(paragraphs);
        this.editService.compare(
          this.data.contentObject,
          newContentObject,
          this.data.story.story_id,
          this.data.prevSection.data.section_id
        );
        if (refresh) {
          this.apiService.refreshStoryContent(
            this.data.prevSection.data.section_id,
            this.data.prevSection.data.title
          );
        }
      }

      // Change the header if necessary
      if (
        header &&
        header.innerHTML !== this.data.prevSection.data.title &&
        JSON.stringify(this.data.prevSection.data.section_id) !==
          JSON.stringify(this.data.story.section_id)
      ) {
        this.editService.editSectionTitle(
          this.data.prevSection.data.section_id,
          header.innerHTML
        );
      }
    }
  }

  // Drag and drop
  public sectionDrag(node) {
    if (node.parent) {
      this.moveSection = node;
    }
  }

  public sectionDragEnter(node) {
    if (this.moveSection && node.parent) {
      this.dragNodeID = node.data.section_id;
    }
  }

  public sectionDrop(node: TreeNode) {
    if (this.moveSection && node.parent) {
      const index: number = node.parent.children.indexOf(node);
      this.editService.moveSection(
        this.moveSection.data.section_id,
        node.parent.data.section_id,
        index
      );
    }
    this.endDrag();
  }

  public endDrag() {
    this.moveSection = null;
    this.dragNodeID = new ID();
  }
}
