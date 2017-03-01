import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatsService } from './stats.service';
import { StatsComponent } from './stats.component';
import {TreeTableModule,
		DataTableModule,
		SharedModule
		} from 'primeng/primeng';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        TreeTableModule,
        DataTableModule,
        SharedModule
            ],
    providers: [StatsService],
    declarations: [StatsComponent],
    bootstrap: [StatsComponent]
})
export class StatsModule {}