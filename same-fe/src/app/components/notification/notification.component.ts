import { NotificationService } from './notification.service';
import { Component, OnInit } from '@angular/core';

export interface Notif {
  type: string;
  message: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  notificationTimeInMs: number = 3000;
  notifications: Notif[] = [];
  constructor(private ns: NotificationService) { }

  ngOnInit() {
    this.ns.pnotif.subscribe((n: Notif) => {
      this.add(n);
    });
  }

  add(notification: Notif): void {
    this.notifications.push(notification);
    setTimeout(() => this.remove(notification), this.notificationTimeInMs);
  }
  remove(notification: Notif) {
    for (let n = 0; n < this.notifications.length; n++) {
      if (this.notifications[n] == notification) {
        this.notifications.splice(n, 1);
      }
    }
  }
}
