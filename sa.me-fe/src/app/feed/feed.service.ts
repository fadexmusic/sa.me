import { Observable } from 'rxjs';
import { serverAdress } from './../app.config';
import { AuthService } from './../services/auth.service';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { Injectable } from '@angular/core';
import { RequestOptions, Headers } from "@angular/http";

@Injectable()
export class FeedService {

 options: RequestOptions = new RequestOptions()
  constructor(private http: AuthHttp, private auth: AuthService) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }
  getFeed(): Observable<any>{
    return this.http.get(serverAdress + 'feed').map(res => res.json());
  }
}
