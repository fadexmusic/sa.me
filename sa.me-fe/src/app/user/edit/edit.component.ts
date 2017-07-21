import { AuthService } from './../../services/auth.service';
import { UserService } from './../user.service';
import { EditService } from './edit.service';
import { Validators, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [EditService]
})
export class EditComponent implements OnInit {
  editForm: FormGroup;
  meLoaded: boolean = false;
  editValid: any = {
    username: { valid: true, message: '' },
    email: { valid: true, message: '' },
    avatar: { valid: true, message: '' },
    password: { valid: true, message: '' },
    bio: { valid: true, message: '' },
  }

  editPasswordForm: FormGroup;
  editPasswordValid: any = {
    newpassword: { valid: true, message: '' },
    newpasswordconfirm: { valid: true, message: '' },
    password: { valid: true, message: '' }
  }

  deleteForm: FormGroup;
  deleteValid: any = {
    password: { valid: true, message: '' }
  }
  constructor(private auth: AuthService, private fb: FormBuilder, private es: EditService) {
    this.editPasswordForm = fb.group({
      newpassword: ['', Validators.required],
      newpasswordconfirm: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.deleteForm = fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.es.getMe().subscribe(res => {
      this.editForm = this.fb.group({
        username: [res.username, Validators.required],
        email: [res.email, Validators.required],
        password: ['', Validators.required],
        avatar: [res.avatar],
        bio: [res.bio]
      });
      for (let i in this.editValid) {
        this.editForm.get(i).valueChanges.subscribe((value) => {
          if (value != "" && value != null) {
            this.editValid[i].valid = true;
            this.editValid[i].message = '';
          }
        });
      }
      this.meLoaded = true;
    });
    for (let i in this.editPasswordValid) {
      this.editPasswordForm.get(i).valueChanges.subscribe((value) => {
        if (value != "" && value != null) {
          this.editPasswordValid[i].valid = true;
          this.editPasswordValid[i].message = '';
        }
      });
    }
    this.deleteForm.get('password').valueChanges.subscribe((value) => {
      if (value != "" && value != null) {
        this.deleteValid.password.valid = true;
        this.deleteValid.password.message = '';
      }
    });
  }

  edit(): void {

    if (this.editForm.valid) {
      this.es.edit(this.editForm.value).subscribe(res => {
        this.auth.setToken(res.text());
        this.editForm.get('password').reset();
      }, err => {
        switch (err.text()) {
          case 'wrong password':
            this.editValid.password.valid = false;
            this.editValid.password.message = 'wrong password';
            break;
          case "username taken":
            this.editValid.username.valid = false;
            this.editValid.username.message = 'username taken'
            break;
          case "email taken":
            this.editValid.email.valid = false;
            this.editValid.email.message = 'account with this email already exists'
            break;
        }
      });
    } else {
      for (let i in this.editValid) {
        if (!this.editForm.get(i).valid) {
          if (i == 'confirmPassword') {
            this.editValid[i].valid = false;
            this.editValid[i].message = 'confirm password required'
          } else {
            this.editValid[i].valid = false;
            this.editValid[i].message = i + ' required'
          }
        }
      }
    }
  }
  editPassword(): void {
    if (this.editPasswordForm.valid) {
      if (this.editPasswordForm.get('newpassword').value == this.editPasswordForm.get('newpasswordconfirm').value) {
        this.es.editPassword(this.editPasswordForm.value).subscribe(res => {
          this.editPasswordForm.reset();
        }, err => {
          switch (err.text()) {
            case 'wrong password':
              this.editPasswordValid.password.valid = false;
              this.editPasswordValid.password.message = 'wrong password';
              break;
          }
        });
      } else {
        this.editPasswordValid.newpasswordconfirm.valid = false;
        this.editPasswordValid.newpasswordconfirm.message = "passwords don't match";
      }
    } else {
      for (let i in this.editPasswordValid) {
        if (!this.editPasswordForm.get(i).valid) {
          if (i == 'password') {
            this.editPasswordValid[i].valid = false;
            this.editPasswordValid[i].message = 'confirm password required'
          } else if (i == 'newpassword') {
            this.editPasswordValid[i].valid = false;
            this.editPasswordValid[i].message = 'new password required'
          } else if (i == 'newpasswordconfirm') {
            this.editPasswordValid[i].valid = false;
            this.editPasswordValid[i].message = 'new password confirmation required'
          }
        }
      }
    }
  }
  deleteAccount(): void {
    if (this.deleteForm.valid) {
      this.es.deleteAccount(this.deleteForm.value).subscribe(res => {
        console.log(res)
      }, err => {
        switch (err.text()) {
          case 'wrong password':
            this.deleteValid.password.valid = false;
            this.deleteValid.password.message = 'wrong password';
            break;
        }
      })
    } else {
      this.deleteValid.password.valid = false;
      this.deleteValid.password.message = 'password required';
    }
  }
}
