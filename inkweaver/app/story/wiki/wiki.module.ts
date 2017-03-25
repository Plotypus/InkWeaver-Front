import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
    MenuModule,
    SharedModule,
    EditorModule,
    TreeTableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ConfirmDialogModule,
    PanelModule,
    DataListModule,
    InputTextareaModule,
    OverlayPanelModule,
    DataGridModule
    
} from 'primeng/primeng';

import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MenuModule,
        SharedModule,
        EditorModule,
        TreeTableModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        DataGridModule,
        PanelModule,
        DataListModule,
        InputTextareaModule,
        OverlayPanelModule,
        ConfirmDialogModule,
        
    ],
    providers: [WikiService],
    declarations: [WikiComponent],
    bootstrap: [WikiComponent]
})
export class WikiModule { }
