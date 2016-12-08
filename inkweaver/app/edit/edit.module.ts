import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    EditorModule,
    SharedModule,
    DataTableModule,
    InputTextModule
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        // PrimeNG Modules
        EditorModule,
        SharedModule,
        DataTableModule,
        InputTextModule
    ],
    providers: [
        EditService
    ],
    declarations: [
        EditComponent
    ]
})
export class EditModule { }
