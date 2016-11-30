import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { WebSocketService } from './websocket.service';

const url = 'ws://localhost:8080/ws';

@Injectable()
export class ParserService {
    public replies: string[];
    public messages: Subject<string>;

    constructor(socket: WebSocketService) {
        this.replies = [];
        this.messages = <Subject<string>>socket
            .connect(url).map((response: MessageEvent): string => response.data);

        this.messages.subscribe(reply => {
            this.replies.push(reply)
        })
    }

    public send(message: string) {
        this.messages.next(message);
    }
}