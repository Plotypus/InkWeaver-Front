import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    InputTextModule,
    EditorModule,
    SharedModule,
    DataTableModule
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        // PrimeNG Modules
        InputTextModule,
        EditorModule,
        SharedModule,
        DataTableModule
    ],
    providers: [
        EditService
    ],
    declarations: [
        EditComponent
    ]
})
export class EditModule { }
