import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    PanelModule,
    ButtonModule,
    CarouselModule,
    DataGridModule
} from 'primeng/primeng';

import { UserService } from './user.service';
import { UserComponent } from './user.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        PanelModule,
        ButtonModule,
        CarouselModule,
        DataGridModule
    ],
    providers: [UserService],
    declarations: [UserComponent],
    bootstrap: [UserComponent]
})
export class UserModule { }
