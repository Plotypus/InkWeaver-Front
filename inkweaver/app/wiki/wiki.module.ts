import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WikiComponent } from './wiki.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        WikiComponent
    ]
})
export class WikiModule { }
