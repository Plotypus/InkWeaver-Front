import { NgModule } from '@angular/core';

// Modules, services, and components
import { ParserService } from './parser.service';
import { WebSocketService } from './websocket.service';

@NgModule({
    providers: [
        ParserService,
        WebSocketService
    ]
})
export class SharedModule { }
