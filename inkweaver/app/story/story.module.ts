import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Third party
import { PanelModule, TabMenuModule } from 'primeng/primeng';

// Modules, services, and components
import { EditModule } from './edit/edit.module';
import { WikiModule } from './wiki/wiki.module';
import { SettingsModule } from './settings/settings.module';
import { StoryComponent } from './story.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        PanelModule,
        TabMenuModule,
        EditModule,
        WikiModule,
        SettingsModule
    ],
    declarations: [StoryComponent],
    bootstrap: [StoryComponent]
})
export class StoryModule { }
