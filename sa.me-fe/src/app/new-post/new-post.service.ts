import { AuthService } from './../services/auth.service';
import { RequestOptions, Headers } from '@angular/http';
import { serverAdress } from './../app.config';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthHttp } from "angular2-jwt/angular2-jwt";

@Injectable()
export class NewPostService {
  uri: string = 'post/';
  options: RequestOptions = new RequestOptions()
  constructor(private http: AuthHttp, private auth: AuthService) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }

  newTextPost(post: TextPost): Observable<any> {
    post.type = 'text';
    let body = JSON.stringify(post);
    return this.http.post(serverAdress + this.uri, body, this.options);
  }
  newImagePost(post: TextPost): Observable<any> {
    post.type = 'image';
    let body = JSON.stringify(post);
    return this.http.post(serverAdress + this.uri, body, this.options);
  }
}
export interface TextPost {
  content: string;
  type: string;
}