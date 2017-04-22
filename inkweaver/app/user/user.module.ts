import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    PanelModule,
    DialogModule,
    ButtonModule,
    InplaceModule,
    DropdownModule,
    DataGridModule,
    InputTextModule,
    InputTextareaModule
} from 'primeng/primeng';

import { UserService } from './user.service';
import { UserComponent } from './user.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,

        // PrimeNG
        PanelModule,
        DialogModule,
        ButtonModule,
        InplaceModule,
        DropdownModule,
        DataGridModule,
        InputTextModule,
        InputTextareaModule
    ],
    providers: [UserService],
    declarations: [UserComponent],
    bootstrap: [UserComponent]
})
export class UserModule { }
