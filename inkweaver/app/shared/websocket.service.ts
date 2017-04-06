import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {
    private ws: WebSocket;
    private subject: Subject<MessageEvent>;

    constructor() { }

    public connect(url: string): Subject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(url);
        }
        return this.subject;
    }

    public close() {
        this.ws.close();
        this.subject = null;
    }

    private create(url: string): Subject<MessageEvent> {
        let wsService = this;
        wsService.ws = new WebSocket(url);

        let observable = Observable.create((obs: Observer<MessageEvent>) => {
            wsService.ws.onmessage = obs.next.bind(obs);
            wsService.ws.onerror = obs.error.bind(obs);
            wsService.ws.onclose = obs.complete.bind(obs);

            return wsService.ws.close.bind(wsService.ws);
        });

        let observer = {
            next: (data: Object) => {
                waitForSocketConnection(wsService.ws, function () {
                    wsService.ws.send(JSON.stringify(data));
                });
            }
        };

        function waitForSocketConnection(ws: any, callback: any) {
            setTimeout(function () {
                if (ws.readyState === 1) {
                    if (callback != null) {
                        callback();
                    }
                    return;
                } else {
                    waitForSocketConnection(ws, callback);
                }
            }, 500);
        }
        return Subject.create(observer, observable);
    }
}
