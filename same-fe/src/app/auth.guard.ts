import { Injectable } from '@angular/core';
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(){
    if(localStorage.getItem('token')){
      return true;
    }
    console.log('navig')
    this.router.navigate(['/login']);
    return false;
  }

}
