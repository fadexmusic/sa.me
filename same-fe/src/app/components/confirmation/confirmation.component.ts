import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent{
  
  @Output() confirmation: EventEmitter<boolean> = new EventEmitter();
  @Input() x: number;
  @Input() y: number;

  constructor() { }

  canceled(): void {
    this.confirmation.emit(false);
  }
  confirmed(): void {
    this.confirmation.emit(true);
  }
  
}
