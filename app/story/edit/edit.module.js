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
const primeng_1 = require('primeng/primeng');
const edit_service_1 = require('./edit.service');
const edit_component_1 = require('./edit.component');
const shared_module_1 = require('../../shared/shared.module');
const stats_module_1 = require('../stats/stats.module');
let EditModule = class EditModule {
};
EditModule = __decorate([
    core_1.NgModule({
        imports: [
            forms_1.FormsModule,
            common_1.CommonModule,
            shared_module_1.SharedModule,
            primeng_1.ButtonModule,
            primeng_1.DialogModule,
            primeng_1.EditorModule,
            primeng_1.DropdownModule,
            primeng_1.InputTextModule,
            primeng_1.TreeTableModule,
            primeng_1.ContextMenuModule,
            primeng_1.DragDropModule,
            primeng_1.ListboxModule,
            stats_module_1.StatsModule,
            primeng_1.ToggleButtonModule
        ],
        providers: [edit_service_1.EditService],
        declarations: [edit_component_1.EditComponent],
        bootstrap: [edit_component_1.EditComponent]
    }), 
    __metadata('design:paramtypes', [])
], EditModule);
exports.EditModule = EditModule;
//# sourceMappingURL=edit.module.js.map