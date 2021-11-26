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
const Rx_1 = require('rxjs/Rx');
let WebSocketService = class WebSocketService {
    constructor() {
    }
    connect(url) {
        if (!this.subject) {
            this.subject = this.create(url);
        }
        return this.subject;
    }
    close() {
        this.ws.close();
        this.subject = null;
    }
    create(url) {
        let wsService = this;
        wsService.ws = new WebSocket(url);
        let observable = Rx_1.Observable.create((obs) => {
            wsService.ws.onmessage = obs.next.bind(obs);
            wsService.ws.onerror = obs.error.bind(obs);
            wsService.ws.onclose = obs.complete.bind(obs);
            return wsService.ws.close.bind(wsService.ws);
        });
        let observer = {
            next: (data) => {
                waitForSocketConnection(wsService.ws, function () {
                    wsService.ws.send(JSON.stringify(data));
                });
            }
        };
        function waitForSocketConnection(ws, callback) {
            setTimeout(function () {
                if (ws.readyState === 1) {
                    if (callback != null) {
                        callback();
                    }
                    return;
                }
                else {
                    waitForSocketConnection(ws, callback);
                }
            }, 500);
        }
        return Rx_1.Subject.create(observer, observable);
    }
};
WebSocketService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [])
], WebSocketService);
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.service.js.map