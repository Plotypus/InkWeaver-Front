import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WikiService } from './wiki.service';
import { WikiComponent } from './wiki.component';
import { MenuModule,
         EditorModule,
         TreeTableModule,
         ButtonModule,
         DialogModule,
         DropdownModule,
         ConfirmDialogModule,
         ConfirmationService,
         SharedModule
    } from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        //Prime
        MenuModule,
        EditorModule,
        TreeTableModule,
        DialogModule,
        ButtonModule,
        ConfirmDialogModule,
        DropdownModule,
        SharedModule
    ],
    providers: [
        WikiService,
        ConfirmationService
    ],
    declarations: [
        WikiComponent
    ]
})
export class WikiModule { }
