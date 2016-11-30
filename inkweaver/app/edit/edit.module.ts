import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditService } from './edit.service';

import { EditPanelComponent } from './edit-panel.component';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
        EditService
    ],
    declarations: [
        EditPanelComponent,
        EditComponent
    ]
})
export class EditModule { }
