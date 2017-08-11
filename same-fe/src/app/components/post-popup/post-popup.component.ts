import { Component, OnInit, EventEmitter, Output, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'app-post-popup',
  templateUrl: './post-popup.component.html',
  styleUrls: ['./post-popup.component.scss']
})
export class PostPopupComponent implements OnInit {
  @Output() end: EventEmitter<any> = new EventEmitter();
  @Input() post: any;
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
  deletePost():void {
    this.end.emit('delete');
  }
}
