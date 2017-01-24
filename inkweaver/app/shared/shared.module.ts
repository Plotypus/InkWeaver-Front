import { NgModule } from '@angular/core';

// Modules, services, and components
import { ParserService } from './parser.service';
import { WebSocketService } from './websocket.service';
import { HierarchyParserService } from './hierarchy-parser.service';
@NgModule({
    providers: [
        ParserService,
        WebSocketService,
        HierarchyParserService
    ]
})
export class SharedModule { }
