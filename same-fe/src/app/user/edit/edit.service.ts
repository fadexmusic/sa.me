import { Observable } from 'rxjs';
import { RequestOptions, Headers } from '@angular/http';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { serverAdress } from './../../app.config';
import { Injectable } from '@angular/core';

@Injectable()
export class EditService {
  options: RequestOptions;
  constructor(private http: AuthHttp) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }
  edit(b: any): Observable<any> {
    return this.http.put(serverAdress + 'user?action=info', JSON.stringify(b), this.options);
  }
  editPassword(b: any): Observable<any>{
    return this.http.put(serverAdress + 'user?action=password', JSON.stringify(b), this.options);
  }
  deleteAccount(b: any): Observable<any>{
    let options = this.options;
    options.body = JSON.stringify(b);
    return this.http.delete(serverAdress + 'user', options);
  }
  getMe(): Observable<any>{
    return this.http.get(serverAdress + 'user', null).map(res => res.json());
  }
}
