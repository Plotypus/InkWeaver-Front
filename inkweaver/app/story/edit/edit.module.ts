import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    ButtonModule,
    DialogModule,
    EditorModule,
    DropdownModule,
    InputTextModule,
    TreeTableModule,
    ContextMenuModule
} from 'primeng/primeng';
import {SharedModule} from '../../shared/shared.module';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ButtonModule,
        DialogModule,
        EditorModule,
        SharedModule,
        DropdownModule,
        InputTextModule,
        TreeTableModule,
        ContextMenuModule
    ],
    providers: [EditService],
    declarations: [
        EditComponent
        
    ],
    bootstrap: [EditComponent]
})
export class EditModule { }
