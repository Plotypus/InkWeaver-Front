﻿import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Third party
import { PanelModule, TabMenuModule } from 'primeng/primeng';

// Modules, services, and components
import { EditModule } from './edit/edit.module';
import { WikiModule } from './wiki/wiki.module';
import { StatsModule } from './stats/stats.module';
import { StoryComponent } from './story.component';
import { StoryService } from './story.service';


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        PanelModule,
        TabMenuModule,
        EditModule,
        WikiModule,
        StatsModule
    ],
    providers: [StoryService],
    declarations: [StoryComponent],
    bootstrap: [StoryComponent]
})
export class StoryModule { }
