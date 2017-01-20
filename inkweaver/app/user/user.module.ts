import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserService } from './user.service';
import { UserComponent } from './user.component';

@NgModule({
    imports: [FormsModule, CommonModule],
    providers: [UserService],
    declarations: [UserComponent],
    bootstrap: [UserComponent]
})
export class UserModule { }
