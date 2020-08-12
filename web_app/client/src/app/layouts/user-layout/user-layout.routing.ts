import { Routes } from '@angular/router';
import { UserProfileComponent } from './pages/profile/user-profile/user-profile.component';
import { UpdateProfileComponent } from './pages/profile/update-profile/update-profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';



export const UserLayoutRoutes: Routes = [
    { 
        path: 'user-profile',
        component: UserProfileComponent
    },
    { 
        path: 'update-profile',
        component: UpdateProfileComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: '',
        redirectTo: 'user-profile'
    }
];