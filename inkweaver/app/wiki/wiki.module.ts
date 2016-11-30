import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
        WikiService
    ],
    declarations: [
        WikiComponent
    ]
})
export class WikiModule { }
