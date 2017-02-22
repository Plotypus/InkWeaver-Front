import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { ApiService } from '../shared/api.service';

const url: string = 'https://localhost:8080/api/login';

@Injectable()
export class LoginService {
    private options = new RequestOptions({
        withCredentials: true
    });

    constructor(private parser: ApiService, private http: Http) { }

    public login(username: string, password: string): Observable<Response> {
        return this.http.post(url, {
            username: username,
            password: password
        }, this.options);
    }
}
