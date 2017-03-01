import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { StatsService } from './stats.service';
import { StatsComponent } from './stats.component';
import {TabViewModule, TreeTableModule} from 'primeng/primeng';
@NgModule({
    imports: [
              FormsModule,
              CommonModule,
        TabViewModule,
        TreeTableModule
            ],
    providers: [StatsService],
    declarations: [StatsComponent],
    bootstrap: [StatsComponent]
})
export class StatsModule {}