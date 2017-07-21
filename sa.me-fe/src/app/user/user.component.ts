import { perPage } from './../app.config';
import { AuthService } from './../services/auth.service';
import { TokenUtil } from './../util/token.util';
import { Post } from './post/post.component';
import { UserService } from './user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [UserService]
})
export class UserComponent implements OnInit {
  user: any;
  posts: Post[] = [];
  loaded: boolean = false;
  isMe: boolean = false;
  follows: boolean = false;

  followers: number = 0;
  following: number = 0;

  offset: number = 0;
  more: boolean = true;

  unfollowButton: string = 'following';
  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService, private us: UserService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.us.getUser(params['username']).subscribe(res => {
        this.user = res;
        this.us.followerCount(this.user._id).subscribe(count => {
          this.followers = count;
        });
        this.us.followingCount(this.user._id).subscribe(count => {
          this.following = count;
        });
        this.us.getPosts(this.user._id, 0, perPage).subscribe(res => {
          if (res.length < perPage) {
            this.more = false;
          }
          this.posts = res;
          this.loaded = true;
        });
        if (this.auth.loggedIn()) {
          if (this.user._id == this.auth.user.id) {
            this.isMe = true;
          } else {
            this.isMe = false;
          }
          if (this.auth.loggedIn()) {
            this.us.follows(this.user._id).subscribe(res => {
              this.follows = res.follows;
            })
          }
        }
      }, err => {
        this.router.navigate(['404']);
      });
    });
  }
  changeFollow(): void {
    this.us.changeFollow(this.user._id).subscribe(res => {
      if (res.text() == 'followed') {
        this.followers++;
        this.follows = true;
      } else if (res.text() == 'unfollowed') {
        this.followers--;
        this.follows = false;
      }
    });
  }
  deletePost(index: number) {
    this.posts.splice(index, 1);
  }
  loadMore(): void {
    this.offset += perPage;
    this.us.getPosts(this.user._id, this.offset, perPage).subscribe(res => {
      if (res.length < perPage) {
        this.more = false;
      }
      this.posts = this.posts.concat(res);
    });
  }
}

