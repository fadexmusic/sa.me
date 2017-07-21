import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { serverAdress } from './../app.config';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

  uri: string = "user/";
  options: RequestOptions;

  constructor(private http: Http, private ahttp: AuthHttp) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }

  getUser(name: string): Observable<any> {
    return this.http.get(serverAdress + this.uri + name).map(res => res.json());
  }
  getPosts(id: string): Observable<any> {
    return this.http.get(serverAdress + 'posts/' + id).map(res => res.json());
  }
  follow(id: string): Observable<any> {
    return this.ahttp.put(serverAdress + 'follow/' + id, JSON.stringify({ follow: 1 }), this.options);
  }
  follows(id: string): Observable<any> {
    return this.ahttp.get(serverAdress + 'follow/' + id, this.options).map(res => res.json());
  }
  unfollow(id: string): Observable<any> {
    return this.ahttp.put(serverAdress + 'follow/' + id, JSON.stringify({ follow: -1 }), this.options);
  }
}
export interface User {
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
}