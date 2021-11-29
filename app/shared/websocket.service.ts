import { Injectable } from "@angular/core";
import { Subject, Observable, Observer } from "rxjs/Rx";

@Injectable()
export class WebSocketService {
  private ws: WebSocket;
  private subject: Subject<MessageEvent>;

  constructor() {}

  // Connect to a URL
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

  // Create a new websocket
  private create(url: string): Subject<MessageEvent> {
    const wsService = this;
    wsService.ws = new WebSocket(url);

    const observable = Observable.create((obs: Observer<MessageEvent>) => {
      wsService.ws.onmessage = obs.next.bind(obs);
      wsService.ws.onerror = obs.error.bind(obs);
      wsService.ws.onclose = obs.complete.bind(obs);

      return wsService.ws.close.bind(wsService.ws);
    });

    // Sending messages
    const observer = {
      next: (data: Object) => {
        waitForSocketConnection(wsService.ws, function () {
          wsService.ws.send(JSON.stringify(data));
        });
      },
    };

    // Wait for the connection before sending
    function waitForSocketConnection(ws: any, callback: any) {
      setTimeout(function () {
        if (ws.readyState === 1) {
          if (callback !== null) {
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
