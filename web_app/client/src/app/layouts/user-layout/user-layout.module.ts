import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './pages/profile/user-profile/user-profile.component';
import { UpdateProfileComponent } from './pages/profile/update-profile/update-profile.component';
import { UserLayoutRoutes } from './user-layout.routing';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { EnumToArrayPipe } from 'src/app/pipes/enum-to-array.pipe';
import { SubscriptionComponent } from './pages/subscription/subscription.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';




@NgModule({
  declarations: [
    UserProfileComponent,
    UpdateProfileComponent,
    EnumToArrayPipe,
    SubscriptionComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(UserLayoutRoutes),
    NgZorroAntdModule,
    MatSnackBarModule
  ]
})
export class UserLayoutModule { }
