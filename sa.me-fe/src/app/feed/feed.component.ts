import { FeedService } from './feed.service';
import { TokenUtil } from './../util/token.util';
import { AuthService } from './../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  providers: [FeedService]
})
export class FeedComponent implements OnInit {
  follows: any = [];
  constructor(private router: Router, private auth: AuthService, private fs: FeedService) { }

  ngOnInit() {
    if(this.auth.loggedIn()){
      this.fs.follows().subscribe(res => {
        this.follows = res;
      });
    } 
  }

}
