import { TokenUtil } from './../util/token.util';
import { User } from './../user/user.service';
import { serverAdress } from './../app.config';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';
import { AuthConfig } from "angular2-jwt/angular2-jwt";

@Injectable()
export class AuthService {
  public token: string;
  public user: any;

  constructor(private http: Http, private tokenUtil: TokenUtil) {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      this.token = token.token;
      this.user = this.tokenUtil.getUser(token.token);
    }
  }

  login(userInfo: User): Observable<any> {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(serverAdress + 'login', JSON.stringify(userInfo), new RequestOptions({ headers: headers }))
      .map((response: Response) => {
        let token = response.text();
        if (token) {
          this.setToken(token);
          return true;
        } else {
          return false;
        }
      });
  }
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', JSON.stringify({ token: token }));
    this.user = this.tokenUtil.getUser(token);
  }
  loggedIn(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  getAuthConfig(): AuthConfig {
    return new AuthConfig({ tokenGetter: (() => this.token) });
  }
}
