import { Injectable } from '@angular/core';
import { RequestOptions, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { serverAdress } from '../app.config';

@Injectable()
export class ForgotPasswordService {
  
  uri: string = "reset/";
  options: RequestOptions;

  constructor(private http: Http) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }
  resetPassword(email: string): Observable<any> {
    return this.http.put(serverAdress + this.uri, JSON.stringify({email: email}), this.options);
  }
}
