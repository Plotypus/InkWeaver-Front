import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';
import {
    MenuModule,
    EditorModule,
    SharedModule,
    AccordionModule,
    InputTextModule
} from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        //Prime
        MenuModule,
        EditorModule,
        SharedModule,
        AccordionModule,
        InputTextModule
    ],
    providers: [
        WikiService
    ],
    declarations: [
        WikiComponent
    ]
})
export class WikiModule { }
