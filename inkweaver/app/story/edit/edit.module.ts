import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';

import {
    ButtonModule,
    DialogModule,
    EditorModule,
    SharedModule,
    DropdownModule,
    InputTextModule,
    TreeTableModule
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        CKEditorModule,
        ButtonModule,
        DialogModule,
        EditorModule,
        SharedModule,
        DropdownModule,
        InputTextModule,
        TreeTableModule
    ],
    providers: [EditService],
    declarations: [EditComponent],
    bootstrap: [EditComponent]
})
export class EditModule { }
