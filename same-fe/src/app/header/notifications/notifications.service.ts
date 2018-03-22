import { serverAdress } from './../../app.config';
import { Observable } from 'rxjs';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class NotificationsService {

  uri: string = "notifications/";

  options: RequestOptions;

  constructor(private http: AuthHttp) {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.options = new RequestOptions({ headers: headers });
  }

  public getNotifications(limit: number): Observable<any> {
    return this.http.get(serverAdress + this.uri + '?limit=' + limit).map(res => res.json()).catch(err => Observable.throw(err));
  }
  public getNotificationCount(): Observable<any> {
    return this.http.get(serverAdress + this.uri + 'count').map(res => res.json()).catch(err => Observable.throw(err));
  }
  public updateNotification(id: string): Observable<any> {
    return this.http.put(serverAdress + this.uri + id, null).catch(err => Observable.throw(err));
  }
}
