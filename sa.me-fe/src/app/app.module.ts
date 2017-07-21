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
    SearchComponent
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
