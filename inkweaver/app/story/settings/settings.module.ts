import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { SettingsService } from './settings.service';
import { SettingsComponent } from './settings.component';

@NgModule({
    imports: [FormsModule, CommonModule, SharedModule],
    providers: [SettingsService],
    declarations: [SettingsComponent],
    bootstrap: [SettingsComponent]
})
export class SettingsModule { }
