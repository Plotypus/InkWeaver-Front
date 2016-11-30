import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    MenuModule,
    InputTextareaModule,
    ButtonModule
} from 'primeng/primeng';

import { EditService } from './edit.service';
import { EditComponent } from './edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        // PrimeNG Modules
        MenuModule,
        InputTextareaModule,
        ButtonModule,
    ],
    providers: [
        EditService
    ],
    declarations: [
        EditComponent
    ]
})
export class EditModule { }
