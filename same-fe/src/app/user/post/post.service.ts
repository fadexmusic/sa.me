import { AuthService } from './../../services/auth.service';
import { RequestOptions, Headers, Http } from '@angular/http';
import { serverAdress } from './../../app.config';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class PostService {
  uri: string = "post/";

  options: RequestOptions;

  constructor(private httpn: Http, private http: AuthHttp, private auth: AuthService) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }
  changeSame(id: string): Observable<any> {
    return this.http.put(serverAdress + this.uri + id, null, this.options);
  }
  getSameCount(id: string): Observable<any> {
    return this.httpn.get(serverAdress + this.uri + id + '/count').map(res => res.text());
  }
  removePost(id: string): Observable<any> {
    return this.http.delete(serverAdress + this.uri + id).map(res => res.text());
  }
  samed(id: string): Observable<any> {
    return this.http.get(serverAdress + this.uri + id, this.options).map(res => res.json());
  }
  getSamers(id: string): Observable<any> {
    return this.http.get(serverAdress + this.uri + id + '/list', this.options).map(res => res.json());
  }
}
