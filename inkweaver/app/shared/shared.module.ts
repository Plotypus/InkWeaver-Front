import { NgModule } from '@angular/core';

// Modules, services, and components
import { ParserService } from './parser.service';
import { WebSocketService } from './websocket.service';
import { DataParserService } from './data-parser.service';

@NgModule({
    providers: [
        ParserService,
        WebSocketService,
        DataParserService
    ]
})
export class SharedModule { }
