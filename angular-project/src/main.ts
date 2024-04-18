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
import { JwtModule } from '@auth0/angular-jwt';
import { errorHandlerInterceptor } from './app/api-authorization/error-handler.interceptor';
import { authGuard } from './app/api-authorization/auth.guard';
import { jwtInterceptor } from './app/api-authorization/jwt.interceptor';

export function getBaseUrl() {
  return 'https://localhost:7186/api';
}

export function tokenGetter() {
  return localStorage.getItem("token");
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

bootstrapApplication(AppComponent, {
    providers: [
      providers,
      importProvidersFrom(BrowserModule, JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['https://localhost:7189'],
          disallowedRoutes: [],
        },
      })),
      provideAnimations(),
      provideHttpClient(withInterceptors([errorHandlerInterceptor, jwtInterceptor])),
      provideRouter([
        { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
        { path: 'login', component: LoginComponent},
        { path: 'register', component: RegistrationComponent},
        { path: 'forum', component: ForumPageComponent,},
        { path: 'create-post', component: CreatePostComponent},
      ])
    ]
})
  .catch(err => console.error(err));
