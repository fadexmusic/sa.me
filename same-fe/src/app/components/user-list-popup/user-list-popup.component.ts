import { Component, OnInit, EventEmitter, Output, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'app-user-list-popup',
  templateUrl: './user-list-popup.component.html',
  styleUrls: ['./user-list-popup.component.scss']
})
export class UserListPopupComponent implements OnInit {

  @Output() end: EventEmitter<any> = new EventEmitter();
  @Input() popupTitle: string = '';
  @Input() userList: any[] = [];
  @ViewChild('popup') popup;

  constructor() { }

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }
  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
  public close(): void {
    this.end.emit();
  }
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == "Escape") {
      this.close();
    }
  }
  onClick($event): void {
    if (!this.popup.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
