import { TokenUtil } from './../util/token.util';
import { AuthService } from './../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  providers: [TokenUtil]
})
export class FeedComponent implements OnInit {

  constructor(private router: Router, private auth: AuthService, private tokenUtil: TokenUtil) { }



  ngOnInit() {
  }

}
