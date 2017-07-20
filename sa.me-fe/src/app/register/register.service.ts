import { User } from './../user/user.component';
import { serverAdress } from './../app.config';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class RegisterService {

  options: RequestOptions;

  constructor(private http: Http) { 
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({headers: headers});
  }

  register(b: User): Observable<any>{
    let body = JSON.stringify(b)
    return this.http.post(serverAdress + 'register', body, this.options);
  }
}
