import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginGuard } from 'src/app/guards/login.guard';
import { RegisterGuard } from 'src/app/guards/register.guard';

export const AuthLayoutRoutes: Routes = [
    { 
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard] 
    },
    { 
        path: 'register',
        component: RegisterComponent,
        canActivate: [RegisterGuard] 
    }
];
