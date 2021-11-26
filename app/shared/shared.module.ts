import { NgModule } from '@angular/core';

// Modules, services, and components
import { ApiService } from './api.service';
import { WebSocketService } from './websocket.service';
import { ParserService } from './parser.service';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
    providers: [
        ApiService,
        WebSocketService,
        ParserService
    ],
    declarations: [TruncatePipe],
    exports: [TruncatePipe]
})
export class SharedModule { }
