import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { StatsService } from "./stats.service";
import { StatsComponent } from "./stats.component";
import {
  TreeTableModule,
  DataTableModule,
  TabViewModule,
  ChartModule,
  DropdownModule,
  ChipsModule,
  MultiSelectModule,
  OverlayPanelModule,
  ButtonModule,
} from "primeng/primeng";
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    TreeTableModule,
    DataTableModule,
    TabViewModule,
    ChartModule,
    SharedModule,
    DropdownModule,
    ChipsModule,
    MultiSelectModule,
    OverlayPanelModule,
    ButtonModule,
  ],
  providers: [StatsService],
  declarations: [StatsComponent],
  exports: [StatsComponent],
  bootstrap: [StatsComponent],
})
export class StatsModule {}
