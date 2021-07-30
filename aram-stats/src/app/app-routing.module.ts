import { LoginComponent } from './components/auth/login/login.component';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewUserComponent } from './components/auth/new-user/new-user.component';
import { ForgotComponent } from './components/auth/forgot/forgot.component';
import { LogoutComponent } from './components/auth/logout/logout.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'register', component: NewUserComponent},
  { path: 'forgot-password', component: ForgotComponent},
  { path: 'logout', component: LogoutComponent},
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
