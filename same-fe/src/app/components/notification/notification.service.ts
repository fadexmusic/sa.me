import { Injectable, EventEmitter, Output } from '@angular/core';
import { Notif } from './notification.component';

@Injectable()
export class NotificationService {

  @Output() pnotif: EventEmitter<Notif> = new EventEmitter();

  pushNotification(notification: Notif): void{
    this.pnotif.emit(notification);
  }
  
}
