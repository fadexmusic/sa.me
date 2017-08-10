import { EditComponent } from './user/edit/edit.component';
import { NewPostComponent } from './new-post/new-post.component';
import { PostComponent } from './user/post/post.component';
import { AuthGuard } from './auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { FeedComponent } from './feed/feed.component';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router'
import { ModuleWithProviders } from "@angular/core";

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full'
    },
    {
        path: 'post',
        component: NewPostComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'feed',
        component: FeedComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '404',
        component: NotFoundComponent
    },
    {
        path: 'edit',
        component: EditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':username',
        component: UserComponent,

    }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);