import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SettingsService } from './settings.service';
import { SettingsComponent } from './settings.component';

@NgModule({
    imports: [FormsModule, CommonModule],
    providers: [SettingsService],
    declarations: [SettingsComponent],
    bootstrap: [SettingsComponent]
})
export class SettingsModule { }
