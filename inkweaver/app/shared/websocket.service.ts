import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {
    private subject: Subject<MessageEvent>;

    constructor() { }

    public connect(url: string): Subject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(url);
        }
        return this.subject;
    }

    private create(url: string): Subject<MessageEvent> {
        let ws = new WebSocket(url);

        let observable = Observable.create((obs: Observer<MessageEvent>) => {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);

            return ws.close.bind(ws);
        });

        let observer = {
            next: (data: Object) => {
                waitForSocketConnection(ws, function () {
                    ws.send(JSON.stringify(data));
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