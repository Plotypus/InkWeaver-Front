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
const api_service_1 = require('../../shared/api.service');
let StatsService = class StatsService {
    constructor(parser) {
        this.parser = parser;
    }
    get_story_statistics(sid) {
        this.parser.send({
            action: 'get_story_statistics'
        });
    }
    get_section_statistics(sid, callback = () => { }) {
        this.parser.send({
            action: 'get_section_statistics',
            section_id: sid
        }, callback);
    }
    get_paragraph_statistics(sid, pid) {
        this.parser.send({
            action: 'get_paragraph_statistics',
            section_id: sid,
            paragragh_id: pid
        });
    }
    get_page_frequency(sid, wid) {
        this.parser.send({
            action: 'get_page_frequencies',
            story_id: sid,
            wiki_id: wid
        });
    }
};
StatsService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [api_service_1.ApiService])
], StatsService);
exports.StatsService = StatsService;
//# sourceMappingURL=stats.service.js.map