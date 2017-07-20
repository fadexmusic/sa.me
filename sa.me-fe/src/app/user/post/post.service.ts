import { AuthService } from './../../services/auth.service';
import { RequestOptions, Headers } from '@angular/http';
import { serverAdress } from './../../app.config';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class PostService {
  uri: string = "post/";

  options: RequestOptions;

  constructor(private http: AuthHttp, private auth: AuthService) { 
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({headers: headers});
  }
  same(id: string): Observable<any>{
    return this.http.put(serverAdress + this.uri + id, JSON.stringify({same: 1}), this.options);
  }
  unsame(id: string): Observable<any>{
    return this.http.put(serverAdress + this.uri + id, JSON.stringify({same: -1}), this.options);
  }
  samed(id: string): Observable<any>{
    return this.http.get(serverAdress + this.uri + id, this.options).map(res => res.json());
  }
}
