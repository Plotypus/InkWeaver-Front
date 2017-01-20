import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
    SharedModule,
    EditorModule,
    TreeTableModule
} from 'primeng/primeng';
import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        EditorModule,
        TreeTableModule
    ],
    providers: [WikiService],
    declarations: [WikiComponent],
    bootstrap: [WikiComponent]
})
export class WikiModule { }
