import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    ButtonModule,
    DialogModule,
    EditorModule,
    SharedModule,
    DropdownModule,
    InputTextModule,
    TreeTableModule,
    ContextMenuModule
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';
import { TruncatePipe } from '../../shared/truncate.pipe';

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
        EditComponent, TruncatePipe
        
    ],
    bootstrap: [EditComponent]
})
export class EditModule { }
