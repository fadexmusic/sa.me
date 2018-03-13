import { AuthService } from './../../services/auth.service';
import { TokenUtil } from './../../util/token.util';
import { NotificationsService } from './notifications.service';
import { Component, OnInit, ViewChild, EventEmitter, Output, HostListener } from '@angular/core';

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [
    NotificationsService
  ]
})
export class NotificationsComponent implements OnInit {
  @ViewChild('notifications') notifs;
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() r: EventEmitter<any> = new EventEmitter();
  canClose: boolean = false;

  notifArray: any[] = [];
  username: string;
  limit: number = 20;
  more: boolean = true;

  constructor(private ns: NotificationsService, private tokenUtil: TokenUtil, private as: AuthService) {
    this.username = tokenUtil.getUser(as.token).username;
  }

  ngOnInit() {
    this.ns.getNotifications(this.limit).subscribe((res) => {
      if (res.length % 20 != 0) {
        this.more = false;
      }
      res.forEach((notif) => {
        notif.ago = this.timeSince(new Date(notif.date));
      });
      this.notifArray = res;
    }, err => {
      this.notifArray = [];
    });
  }
  loadMore(): void {
    this.limit += 20;
    this.ns.getNotifications(this.limit).subscribe((res) => {
      if (res.length % 20 != 0) {
        this.more = false;
      }
      res.forEach((notif) => {
        notif.ago = this.timeSince(new Date(notif.date));
      });
      this.notifArray = res;
    }, err => {
      this.notifArray = null;
    });
  }
  public read(index: number): void {
    if (!this.notifArray[index].read) {
      this.ns.updateNotification(this.notifArray[index]._id).subscribe(res => {
        this.r.emit();
        this.notifArray[index].read = true;
      });
    }
  }
  end(): void {
    this.close.emit();
  }
  onClick($event): void {
    if (this.canClose) {
      if (!this.notifs.nativeElement.contains(event.target)) {
        this.end();
      }
    }
    this.canClose = true;
  }
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == "Escape") {
      this.end();
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
