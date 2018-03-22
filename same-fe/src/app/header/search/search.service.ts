import { serverAdress } from './../../app.config';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class SearchService {

  uri: string = 'search'

  constructor(private http: Http) { }

  search(query: string): Observable<any>{
    return this.http.get(serverAdress + this.uri + '?query=' + query).map(res => res.json());
  }
}
