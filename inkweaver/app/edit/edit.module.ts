import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';

import { EditService } from './edit.service';

import { EditPanelComponent } from './edit-panel.component';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule
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
