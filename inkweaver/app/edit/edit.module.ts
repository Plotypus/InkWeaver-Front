import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';

import {
    ButtonModule,
    DialogModule,
    SharedModule,
    DropdownModule,
    DataTableModule,
    InputTextModule,
    ConfirmDialogModule,
    ConfirmationService
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CKEditorModule,

        // PrimeNG Modules
        ButtonModule,
        DialogModule,
        SharedModule,
        DropdownModule,
        DataTableModule,
        InputTextModule,
        ConfirmDialogModule
    ],
    providers: [
        EditService,
        ConfirmationService
    ],
    declarations: [
        EditComponent
    ]
})
export class EditModule { }
