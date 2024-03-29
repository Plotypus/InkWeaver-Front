﻿import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";

import { PanelModule, ButtonModule, GrowlModule } from "primeng/primeng";
import { LoginService } from "./login.service";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    HttpModule,

    // PrimeNG
    PanelModule,
    ButtonModule,
    GrowlModule,
  ],
  providers: [LoginService],
  declarations: [LoginComponent],
  bootstrap: [LoginComponent],
})
export class LoginModule {}
