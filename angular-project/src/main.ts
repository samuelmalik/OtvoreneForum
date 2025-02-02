import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RegistrationComponent } from './app/api-authorization/registration/registration.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {LoginComponent} from "./app/api-authorization/login/login.component";
import { DashboardComponent } from './app/dashboard/dashboard.component';
import {ForumPageComponent} from "./app/forum-page/forum-page.component";
import { CreatePostComponent} from "./app/create-post/create-post.component";
import {PostDetailsComponent} from "./app/post-details/post-details.component";
import {NotificationsComponent} from "./app/notifications/notifications.component";
import { JwtModule } from '@auth0/angular-jwt';
import { errorHandlerInterceptor } from './app/api-authorization/error-handler.interceptor';
import { authGuard } from './app/api-authorization/auth.guard';
import { jwtInterceptor } from './app/api-authorization/jwt.interceptor';
import {provideHighlightOptions} from "ngx-highlightjs";
import {MaterialPageComponent} from "./app/material-page/material-page.component";
import {DownloadComponent} from "./app/download/download.component";
import {UploadComponent} from "./app/upload/upload.component";
import {EmailVerificationComponent} from "./app/email-verification/email-verification.component";
import {ForgotPasswordComponent} from "./app/forgot-password/forgot-password.component";

export function getBaseUrl() {
  return 'https://samko123.bsite.net/api';
  //return 'https://localhost:7186/api';
}

export function tokenGetter() {
  return localStorage.getItem("token");
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

bootstrapApplication(AppComponent, {
    providers: [
      provideHighlightOptions({
        fullLibraryLoader: () => import('highlight.js'),
        lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      }),
      providers,
      importProvidersFrom(BrowserModule, JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['https://samko123.bsite.net/', 'https://localhost:7186/'],
          disallowedRoutes: [],
        },
      })),
      provideAnimations(),
      provideHttpClient(withInterceptors([errorHandlerInterceptor, jwtInterceptor])),
      provideRouter([
        { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
        { path: 'login', component: LoginComponent},
        { path: 'register', component: RegistrationComponent},
        { path: 'forum', component: ForumPageComponent},
        { path: '', component: ForumPageComponent},
        { path: 'create-post', component: CreatePostComponent, canActivate: [authGuard]},
        { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard]},
        { path: 'post-details/:postId', component: PostDetailsComponent},
        {path: 'material', component: DownloadComponent, canActivate: [authGuard]},
        { path: 'email-verification', component: EmailVerificationComponent },
        { path: 'forgot-password', component: ForgotPasswordComponent },


      ])
    ]
})
  .catch(err => console.error(err));
