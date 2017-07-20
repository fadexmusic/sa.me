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
  
  constructor(private router: Router, private route: ActivatedRoute, private us: UserService) { }
  


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.us.getUser(params['username']).subscribe(res => {
        this.user = res;
      }, err => {
        this.router.navigate(['404']);
      });
      this.us.getPosts(params['username']).subscribe(res => {
        this.posts = res;
        this.loaded = true;
      });
    });
  }

}

export interface User {
  username: string;
  email: string;
  password: string;
  avatar: string;
}