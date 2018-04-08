import { NotificationService } from './../components/notification/notification.service';
import { AuthService } from './../services/auth.service';
import { Router } from '@angular/router';
import { RegisterService } from './register.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [RegisterService]
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  valid: any = {
    username: { valid: true, message: '' },
    email: { valid: true, message: '' },
    avatar: { valid: true, message: '' },
    password: { valid: true, message: '' },
    confirmPassword: { valid: true, message: '' }
  }
  constructor(private rs: RegisterService, private fb: FormBuilder, private router: Router, private auth: AuthService, private ns: NotificationService) {
    this.registerForm = fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      avatar: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }
  ngOnInit() {
    for (let i in this.valid) {
      this.registerForm.get(i).valueChanges.subscribe((value) => {
        if (value != "" && value != null) {
          this.valid[i].valid = true;
          this.valid[i].message = '';
        }
      });
    }
  }
  register(): void {
    if (this.registerForm.valid) {
      if (this.registerForm.get('password').value == this.registerForm.get('confirmPassword').value) {
        this.rs.register(this.registerForm.value).subscribe(res => {
          this.auth.login({ username: this.registerForm.get('username').value, password: this.registerForm.get('password').value }).subscribe(res => {
            if (res) {
              this.ns.pushNotification({ type: 'success', message: 'registered, you are now logged in' });
              this.auth.refresh.emit();
              this.router.navigate(['feed']);
            }
          });
        }, err => {
          switch (err.text()) {
            case "username taken":
              this.valid.username.valid = false;
              this.valid.username.message = 'username taken'
              break;
            case "email taken":
              this.valid.email.valid = false;
              this.valid.email.message = 'account with this email already exists'
              break;
            /*case "invalid email":
              this.valid.email.valid = false;
              this.valid.email.message = 'invalid email'
              break;*/
            case "wrong image":
              this.valid.avatar.valid = false;
              this.valid.avatar.message = "the link isn't an image"
              break;

          }
        });
      } else {
        this.valid.confirmPassword.valid = false;
        this.valid.confirmPassword.message = "passwords don't match";
      }
    } else {
      for (let i in this.valid) {

        if (!this.registerForm.get(i).valid) {
          if (i == 'confirmPassword') {
            this.valid[i].valid = false;
            this.valid[i].message = 'confirm password required'
          }else if(i = 'email'){
            this.valid[i].valid = false;
            this.valid[i].message = 'invalid email';
          } else {
            this.valid[i].valid = false;
            this.valid[i].message = i + ' required'

          }
        }
      }

    }
  }

}
