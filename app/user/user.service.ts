﻿import { Injectable } from "@angular/core";

import { ApiService } from "../shared/api.service";

import { ID } from "../models/id.model";

@Injectable()
export class UserService {
  constructor(private apiService: ApiService) {}

  // Get Stuff
  public getUserPreferences() {
    this.apiService.send({
      action: "get_user_preferences",
    });
  }

  public getUserStoriesAndWikis() {
    this.apiService.send({
      action: "get_user_stories_and_wikis",
    });
  }

  // Set User Information
  public setUserName(name: string) {
    this.apiService.send({
      action: "set_user_name",
      name: name,
    });
  }

  public setUserEmail(email: string) {
    this.apiService.send({
      action: "set_user_email",
      email: email,
    });
  }

  public setUserBio(bio: string) {
    this.apiService.send({
      action: "set_user_bio",
      bio: bio,
    });
  }

  public setUserAvatar(avatar: string) {
    this.apiService.send({
      action: "set_user_avatar",
      avatar: avatar,
    });
  }

  // Set position context
  public setUserStoryPositionContext(sectionID: ID, paragraphID: ID) {
    this.apiService.send({
      action: "set_user_story_position_context",
      position_context: { section_id: sectionID, paragraph_id: paragraphID },
    });
  }

  // Sign out
  public signOut() {
    this.apiService.send({
      action: "sign_out",
    });
  }
}
