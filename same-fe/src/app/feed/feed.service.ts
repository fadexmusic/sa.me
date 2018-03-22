import { Observable } from 'rxjs';
import { serverAdress } from './../app.config';
import { AuthService } from './../services/auth.service';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { Injectable } from '@angular/core';
import { RequestOptions, Headers } from "@angular/http";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class FeedService {

  options: RequestOptions = new RequestOptions()
  constructor(private http: AuthHttp, private auth: AuthService) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }
  getFeed(offset: number, limit: number): Observable<any> {
    return this.http.get(serverAdress + 'feed?offset=' + offset + '&limit=' + limit).map(res => res.json());
  }
}
