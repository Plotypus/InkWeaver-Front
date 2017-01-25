import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { ParserService } from '../shared/parser.service';

const url: string = 'http://localhost:8080/api/login';

@Injectable()
export class LoginService {
    private options = new RequestOptions({
        headers: new Headers({ 'Content-Type': 'text/plain' })
    });

    constructor(private parser: ParserService, private http: Http) { }

    public login(username: string, password: string): Observable<Response> {
        return this.http.post(url, {
            username: username,
            password: password
        }, this.options);
    }
}
