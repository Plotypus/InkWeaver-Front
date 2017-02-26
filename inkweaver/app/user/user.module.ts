import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    PanelModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    DataGridModule,
    InputTextareaModule
} from 'primeng/primeng';

import { UserService } from './user.service';
import { UserComponent } from './user.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        PanelModule,
        DialogModule,
        ButtonModule,
        DropdownModule,
        DataGridModule,
        InputTextareaModule
    ],
    providers: [UserService],
    declarations: [UserComponent],
    bootstrap: [UserComponent]
})
export class UserModule { }
