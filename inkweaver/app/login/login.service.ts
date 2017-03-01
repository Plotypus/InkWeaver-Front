import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { ApiService } from '../shared/api.service';

const url: string = 'http://localhost:8080/api/login';
const urlAuth: string = 'https://inkweaver.plotypus.net:8080/api/login';

@Injectable()
export class LoginService {
    private options = new RequestOptions({
        withCredentials: true
    });

    constructor(private apiService: ApiService, private http: Http) { }

    public login(username: string, password: string): Observable<Response> {
        let path: string = this.apiService.authentication ? urlAuth : url;

        return this.http.post(path, {
            username: username,
            password: password
        }, this.options);
    }
}
