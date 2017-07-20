import { TokenUtil } from './../util/token.util';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: any;

  constructor(private auth: AuthService, private tokenUtil: TokenUtil) {
    if (auth.loggedIn()) {
      this.user = this.tokenUtil.getUser(this.auth.token);
    }
  }

  ngOnInit() {
    
  }
  ngOnChanges(){
    
  }

}
