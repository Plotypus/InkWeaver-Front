import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SettingsService } from './settings.service';
import { SettingsComponent } from './settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
        SettingsService
    ],
    declarations: [
        SettingsComponent
    ]
})
export class SettingsModule { }
