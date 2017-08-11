import { NotificationsService } from './notifications/notifications.service';
import { TokenUtil } from './../util/token.util';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    NotificationsService
  ]
})
export class HeaderComponent implements OnInit {



  public notificationsOpen: boolean = false;
  public unreadNotifs: number = 0;
  constructor(public auth: AuthService, private ns: NotificationsService) {
  }

  ngOnInit() {
    this.auth.refresh.subscribe((res) => {
      this.ns.getNotificationCount().subscribe(res => {
        this.unreadNotifs = res;
      });
    });
    this.ns.getNotificationCount().subscribe(res => {
      this.unreadNotifs = res;
    });
  }
  ngOnChanges() {
    this.ns.getNotificationCount().subscribe(res => {
      this.unreadNotifs = res;
    });
  }
  public notifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }
  read(): void {
    this.unreadNotifs--;
  }
}
