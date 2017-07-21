import { PostService } from './post.service';
import { User } from './../user.service';
import { UserService } from './../user.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  providers: [PostService]
})
export class PostComponent implements OnInit {

  @Input() post: Post;
  @Input() user: any;
  samed: boolean = false;
  posted: String;
  aDay = 24 * 60 * 60 * 1000;

  constructor(public auth: AuthService, private us: UserService, private ps: PostService) { }

  ngOnInit() {
    this.posted = this.timeSince(new Date(new Date(this.post.posted))) + ' ago';
    if (this.auth.loggedIn()) {
      this.ps.samed(this.post._id).subscribe(res => {
        this.samed = res.samed;
      });
    }
  }

  same(): void {
    if (this.auth.loggedIn()) {
      if (!this.samed) {
        this.ps.same(this.post._id).subscribe(res => {
          this.samed = true;
          this.post.sames++;
        });
      }else{
        this.unsame();
      }
    }
  }
  unsame(): void {
    if (this.auth.loggedIn()) {
      this.ps.unsame(this.post._id).subscribe(res => {
        this.samed = false;
        this.post.sames--;
      });
    }
  }

  timeSince(date: Date) {

    var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      if (interval == 1) {
        return interval + " month";
      }
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      if (interval == 1) {
        return interval + " day";
      }
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      if (interval == 1) {
        return interval + " hour";
      }
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      if (interval == 1) {
        return interval + " minute";
      }
      return interval + " minutes";
    }
    if (interval == 1) {
      return interval + " second";
    }
    return Math.floor(seconds) + " seconds";
  }
}
export interface Post {
  _id: string;
  type: string;
  by: string;
  content: string;
  posted: string;
  sames: number;
  notsames: number;
}
