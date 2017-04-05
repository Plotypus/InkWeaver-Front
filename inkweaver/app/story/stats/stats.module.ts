import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatsService } from './stats.service';
import { StatsComponent } from './stats.component';
import {TreeTableModule,
		DataTableModule,
		TabViewModule,
        TreeModule,
        ChartModule,
        DropdownModule,
        ChipsModule
} from 'primeng/primeng';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        TreeTableModule,
        DataTableModule,
        TabViewModule,
        ChartModule,
        TreeModule,
        SharedModule,
        DropdownModule,
        ChipsModule
            ],
    providers: [StatsService],
    declarations: [StatsComponent],
    bootstrap: [StatsComponent]
})
export class StatsModule {}