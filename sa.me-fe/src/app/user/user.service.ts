import { Observable } from 'rxjs';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { serverAdress } from './../app.config';
import { Http, RequestOptions, Headers } from '@angular/http';
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
    return this.http.get(serverAdress + this.uri + name + '?by=name').map(res => res.json());
  }
  getUserById(id: string): Observable<any> {
    return this.http.get(serverAdress + this.uri + id + '?by=id').map(res => res.json());
  }
  getPosts(id: string, offset: number, limit: number): Observable<any> {
    return this.http.get(serverAdress + 'posts/' + id + '?offset=' + offset + '&limit=' + limit).map(res => res.json());
  }
  followerCount(id: string): Observable<any> {
    return this.http.get(serverAdress + 'followers/' + id + '/count').map(res => res.text());
  }
  followingCount(id: string): Observable<any> {
    return this.http.get(serverAdress + 'following/' + id + '/count').map(res => res.text());
  }
  changeFollow(id: string): Observable<any> {
    return this.ahttp.put(serverAdress + 'follow/' + id, null, this.options);
  }
  follows(id: string): Observable<any> {
    return this.ahttp.get(serverAdress + 'follow/' + id, this.options).map(res => res.json());
  }
}
export interface User {
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
}