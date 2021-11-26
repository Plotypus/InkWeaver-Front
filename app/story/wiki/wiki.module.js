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
const filter_pipe_1 = require('./filter.pipe');
const json_pipe_1 = require('./json.pipe');
const primeng_1 = require('primeng/primeng');
const wiki_service_1 = require('./wiki.service');
const wiki_component_1 = require('./wiki.component');
const stats_module_1 = require('../stats/stats.module');
let WikiModule = class WikiModule {
};
WikiModule = __decorate([
    core_1.NgModule({
        imports: [
            forms_1.FormsModule,
            common_1.CommonModule,
            primeng_1.MenuModule,
            primeng_1.SharedModule,
            primeng_1.EditorModule,
            primeng_1.TreeTableModule,
            primeng_1.ButtonModule,
            primeng_1.DialogModule,
            primeng_1.DropdownModule,
            primeng_1.DataGridModule,
            primeng_1.PanelModule,
            primeng_1.DataListModule,
            primeng_1.InputTextareaModule,
            primeng_1.OverlayPanelModule,
            primeng_1.ConfirmDialogModule,
            primeng_1.ListboxModule,
            primeng_1.CheckboxModule,
            primeng_1.ContextMenuModule,
            stats_module_1.StatsModule,
            primeng_1.ToggleButtonModule,
            primeng_1.DragDropModule,
            primeng_1.TooltipModule,
            primeng_1.TreeModule
        ],
        providers: [wiki_service_1.WikiService, filter_pipe_1.FilterPipe, json_pipe_1.JsonPipe],
        declarations: [wiki_component_1.WikiComponent, filter_pipe_1.FilterPipe, json_pipe_1.JsonPipe],
        bootstrap: [wiki_component_1.WikiComponent]
    }), 
    __metadata('design:paramtypes', [])
], WikiModule);
exports.WikiModule = WikiModule;
//# sourceMappingURL=wiki.module.js.map