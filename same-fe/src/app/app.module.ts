import { NotificationService } from './components/notification/notification.service';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { AuthGuard } from './auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { TokenUtil } from './util/token.util';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { routing } from './app.routing';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, RequestOptions, Http } from '@angular/http';

import { AppComponent } from './app.component';
import { FeedComponent } from './feed/feed.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { PostComponent } from './user/post/post.component';
import { NewPostComponent } from './new-post/new-post.component';
import { SearchComponent } from './header/search/search.component';

import { ClickOutsideModule } from 'ng-click-outside';
import { EditComponent } from './user/edit/edit.component';
import { UserListPopupComponent } from './components/user-list-popup/user-list-popup.component';
import { NotificationsComponent } from './header/notifications/notifications.component';
import { PostPopupComponent } from './components/post-popup/post-popup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export function authHttpServiceFactory(http: Http, options: RequestOptions, as: AuthService) {
  return new AuthHttp(as.getAuthConfig(), http, options);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FeedComponent,
    UserComponent,
    RegisterComponent,
    HeaderComponent,
    NotFoundComponent,
    PostComponent,
    NewPostComponent,
    SearchComponent,
    EditComponent,
    UserListPopupComponent,
    NotificationComponent,
    ConfirmationComponent,
    NotificationsComponent,
    PostPopupComponent,
    ForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    routing,
    ClickOutsideModule  
  ],
  providers: [
    AuthService,
    TokenUtil,
    AuthGuard,
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, AuthService]
    },
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
