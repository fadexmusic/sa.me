import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  valid: any = {
    username: { valid: true, message: '' },
    password: { valid: true, message: '' }
  }

  constructor(private auth: AuthService, private fb: FormBuilder, private router: Router) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  ngOnInit() {
    this.auth.logout();
    for (let i in this.valid) {
      this.loginForm.get(i).valueChanges.subscribe((value) => {
        if (value != "" && value != null) {
          this.valid[i].valid = true;
          this.valid[i].message = '';
        }
      });
    }
  }

  login(): void {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe(res => {
        console.log(res)
        if (res) {
          location.href = '/feed';//this.router.navigate(['feed']);
        }
      }, err => {
        switch (err.text()) {
          case "invalid username":
            this.valid.username.valid = false;
            this.valid.username.message = 'invalid username'
            break;
          case "invalid password":
            this.valid.password.valid = false;
            this.valid.password.message = 'invalid password'
            break;
        }
      })
    } else {
      for (let i in this.valid) {
        if (!this.loginForm.get(i).valid) {
          this.valid[i].valid = false;
          this.valid[i].message = i + ' required'
        }
      }
    }
  }
}
