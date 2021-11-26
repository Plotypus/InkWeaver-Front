"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const forms_1 = require('@angular/forms');
const common_1 = require('@angular/common');
const stats_service_1 = require('./stats.service');
const stats_component_1 = require('./stats.component');
const primeng_1 = require('primeng/primeng');
const shared_module_1 = require('../../shared/shared.module');
let StatsModule = class StatsModule {
};
StatsModule = __decorate([
    core_1.NgModule({
        imports: [
            forms_1.FormsModule,
            common_1.CommonModule,
            primeng_1.TreeTableModule,
            primeng_1.DataTableModule,
            primeng_1.TabViewModule,
            primeng_1.ChartModule,
            shared_module_1.SharedModule,
            primeng_1.DropdownModule,
            primeng_1.ChipsModule,
            primeng_1.MultiSelectModule,
            primeng_1.OverlayPanelModule,
            primeng_1.ButtonModule
        ],
        providers: [stats_service_1.StatsService],
        declarations: [stats_component_1.StatsComponent],
        exports: [stats_component_1.StatsComponent],
        bootstrap: [stats_component_1.StatsComponent]
    }), 
    __metadata('design:paramtypes', [])
], StatsModule);
exports.StatsModule = StatsModule;
//# sourceMappingURL=stats.module.js.map