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
  
  unfollowButton: string = 'following';
  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService, private us: UserService, private tokenUtil: TokenUtil) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.us.getUser(params['username']).subscribe(res => {
        this.user = res;
        this.us.getPosts(this.user._id).subscribe(res => {
          this.posts = res;
          this.loaded = true;
        });
        if (this.auth.loggedIn()) {
          if (this.user._id == this.tokenUtil.getUser(this.auth.token).id) {
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
  follow(): void {
    this.us.follow(this.user._id).subscribe(res => {
      this.user.followers++;
      this.follows = true;
    });
  }
  unfollow(): void{
    this.us.unfollow(this.user._id).subscribe(res => {
      this.user.followers--;
      this.follows = false;
    });
  }
}

