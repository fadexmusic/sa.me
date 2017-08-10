import { perPage } from './../app.config';
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
  offset: number = 0;
  more: boolean = true;
  constructor(private router: Router, private auth: AuthService, private fs: FeedService) { }

  ngOnInit() {
    if (this.auth.loggedIn()) {
      this.fs.getFeed(0, perPage).subscribe(res => {
        if (res.length < perPage) {
          this.more = false;
        }
        this.posts = res;
        console.log(this.posts)
        this.loaded = true;
      });
    }
  }
  loadMore(): void {
    if (this.auth.loggedIn()) {
      this.offset += perPage;
      this.fs.getFeed(this.offset, perPage).subscribe(res => {
        if (res.length < perPage) {
          this.more = false;
        }
        this.posts = this.posts.concat(res);
      });
    }
  }
}
