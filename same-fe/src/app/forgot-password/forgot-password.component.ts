import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ForgotPasswordService } from './forgot-password.service';
import { NotificationService } from '../components/notification/notification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [
    ForgotPasswordService
  ]
})
export class ForgotPasswordComponent implements OnInit {

  
  resetForm: FormGroup;
  valid: any = {
    email: { valid: true, message: '' }
  }

  constructor(private ns: NotificationService,private fb: FormBuilder, private router: Router, private fs: ForgotPasswordService) {
    this.resetForm = fb.group({
      email: ['', Validators.required]
    })
  }
  ngOnInit() {
    for (let i in this.valid) {
      this.resetForm.get(i).valueChanges.subscribe((value) => {
        if (value != "" && value != null) {
          this.valid[i].valid = true;
          this.valid[i].message = '';
        }
      });
    }
  }
  public resetPassword(): void{
    if (this.resetForm.valid) {
      //reset
      this.fs.resetPassword(this.resetForm.get('email').value).subscribe(res => {
        this.router.navigate(['/login']);
        this.ns.pushNotification({
          type: 'success',
          message: 'password reset'
        });
      }, err =>{
        this.valid.email.valid = false;
        this.valid.email.message = 'user with this email doesnt exist';
      });
    } else {
      for (let i in this.valid) {
        if (!this.resetForm.get(i).valid) {
          this.valid[i].valid = false;
          this.valid[i].message = i + ' required'
        }
      }
    }
  }

}
