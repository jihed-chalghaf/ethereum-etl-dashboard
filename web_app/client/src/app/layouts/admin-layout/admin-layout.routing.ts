import { Routes } from '@angular/router';
import { UserProfileComponent } from '../../pages/profile/user-profile/user-profile.component';
import { UsersComponent } from './pages/users/users.component';

export const AdminLayoutRoutes: Routes = [
    { 
        path: 'user-profile',
        component: UserProfileComponent
    },
    { 
        path: 'users',
        component: UsersComponent
    }
];
