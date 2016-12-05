﻿import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';
import { AccordionModule, MenuModule, SharedModule } from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        //Prime
        AccordionModule,
        MenuModule,
        SharedModule
    ],
    providers: [
        WikiService
    ],
    declarations: [
        WikiComponent
    ]
})
export class WikiModule { }
