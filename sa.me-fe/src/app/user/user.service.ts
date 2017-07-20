import { serverAdress } from './../app.config';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

  uri: string = "user";

  constructor(private http: Http) { }

  getUser(name: string): Observable<any> {
    return this.http.get(serverAdress + this.uri + '/' + name).map(res => res.json());
  }
  getPosts(name: string): Observable<any>{
    return this.http.get(serverAdress + 'posts/' + name).map(res => res.json());
  }
}
export interface User {
  username: string;
  email: string;
  password: string;
  avatar: string;
}