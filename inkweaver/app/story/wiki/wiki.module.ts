import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../shared/filter.pipe';
import {JsonPipe} from './json.pipe';
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
    DataGridModule,
    ListboxModule,
    CheckboxModule
    
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
        ListboxModule,
        CheckboxModule
        
    ],
    providers: [WikiService, FilterPipe, JsonPipe],
    declarations: [WikiComponent, FilterPipe, JsonPipe],
    bootstrap: [WikiComponent]
})
export class WikiModule { }
