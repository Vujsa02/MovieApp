import { Injectable } from '@angular/core';
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";
import {Observable} from "rxjs";
import {environment} from "../../environment";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket$: WebSocketSubject<any>;
  private url = environment.webSocketUrl;

  constructor() {
    this.socket$ = webSocket(this.url);
  }

  connect(): Observable<any> {
    return this.socket$.asObservable();
  }
}
