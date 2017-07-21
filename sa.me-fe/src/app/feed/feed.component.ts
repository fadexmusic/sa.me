import { UserService } from './../user/user.service';
import { FeedService } from './feed.service';
import { TokenUtil } from './../util/token.util';
import { AuthService } from './../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  providers: [FeedService, UserService]
})
export class FeedComponent implements OnInit {
  posts: any = [];
  loaded: boolean;
  constructor(private router: Router, private auth: AuthService, private fs: FeedService) { }

  ngOnInit() {
    if (this.auth.loggedIn()) {
      this.fs.getFeed().subscribe(res => {
        console.log(res);
        this.posts = res;
        this.loaded = true;
      });
    }
  }

}
