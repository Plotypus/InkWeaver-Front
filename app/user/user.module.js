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
const user_service_1 = require('./user.service');
const user_component_1 = require('./user.component');
let UserModule = class UserModule {
};
UserModule = __decorate([
    core_1.NgModule({
        imports: [
            forms_1.FormsModule,
            common_1.CommonModule,
            primeng_1.PanelModule,
            primeng_1.DialogModule,
            primeng_1.ButtonModule,
            primeng_1.InplaceModule,
            primeng_1.DropdownModule,
            primeng_1.DataGridModule,
            primeng_1.InputTextModule,
            primeng_1.InputTextareaModule
        ],
        providers: [user_service_1.UserService],
        declarations: [user_component_1.UserComponent],
        bootstrap: [user_component_1.UserComponent]
    }), 
    __metadata('design:paramtypes', [])
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map