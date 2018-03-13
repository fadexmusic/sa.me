import { NotificationService } from './../components/notification/notification.service';
import { Router } from '@angular/router';
import { NewPostService } from './new-post.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
  providers: [NewPostService]
})
export class NewPostComponent implements OnInit {

  type: string = "text";

  textForm: FormGroup;
  textValid = {
    content: { valid: true, message: '' }
  }

  imageForm: FormGroup;
  imageValid = {
    content: { valid: true, message: '' },
    description: { valid: true, message: '' }
  };
  constructor(private router: Router, private fb: FormBuilder, private ns: NewPostService, private nos: NotificationService) {
    this.textForm = fb.group({
      content: ['', Validators.required]
    });
    this.imageForm = fb.group({
      content: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.textForm.get('content').valueChanges.subscribe(value => {
      if (value != '' || value != null) {
        this.textValid.content.valid = true;
        this.textValid.content.message = '';
      }
    });
    this.imageForm.get('content').valueChanges.subscribe(value => {
      if (value != '' || value != null) {
        this.imageValid.content.valid = true;
        this.imageValid.content.message = '';
      }
    });
  }

  submitText(): void {
    if (this.textForm.valid) {
      this.ns.newTextPost(this.textForm.value).subscribe(res => {
        this.nos.pushNotification({type: 'success', message: 'text posted'});
        this.router.navigate(['/feed']);
      });
    } else {
      this.textValid.content.valid = false;
      this.textValid.content.message = 'please write your post';
    }
  }
  submitImage(): void {
    if (this.imageForm.valid) {
      this.ns.newImagePost(this.imageForm.value).subscribe(res => {
        this.nos.pushNotification({type: 'success', message: 'image posted'});
        this.router.navigate(['/feed']);
      }, err => {
        this.imageValid.content.valid = false;
        this.imageValid.content.message = "the link is not an image";
      });
    } else {
      this.imageValid.content.valid = false;
      this.imageValid.content.message = 'please insert the image url';
    }
  }

}
