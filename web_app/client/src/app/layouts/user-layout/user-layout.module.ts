import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './pages/profile/user-profile/user-profile.component';
import { UpdateProfileComponent } from './pages/profile/update-profile/update-profile.component';
import { UserLayoutRoutes } from './user-layout.routing';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { EnumToArrayPipe } from 'src/app/pipes/enum-to-array.pipe';




@NgModule({
  declarations: [
    UserProfileComponent,
    UpdateProfileComponent,
    EnumToArrayPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(UserLayoutRoutes),
    NgZorroAntdModule
  ]
})
export class UserLayoutModule { }
