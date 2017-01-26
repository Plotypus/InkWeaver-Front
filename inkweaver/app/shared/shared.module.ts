import { NgModule } from '@angular/core';

// Modules, services, and components
import { ApiService } from './api.service';
import { WebSocketService } from './websocket.service';
import { ParserService } from './parser.service';

@NgModule({
    providers: [
        ApiService,
        WebSocketService,
        ParserService
    ]
})
export class SharedModule { }
