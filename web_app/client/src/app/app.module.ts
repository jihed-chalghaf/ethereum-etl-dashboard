import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { EnvServiceProvider } from './services/env.service.provider';
import { AuthInterceptorProvider } from './interceptors/auth.interceptor';
import { UserProfileComponent } from './pages/profile/user-profile/user-profile.component';
import { UpdateProfileComponent } from './pages/profile/update-profile/update-profile.component';
import { EnumToArrayPipe } from './pipes/enum-to-array.pipe';
import { NgZorroAntdModule, en_US, NZ_I18N } from 'ng-zorro-antd';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    NgZorroAntdModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    UserProfileComponent,
    UpdateProfileComponent,
    EnumToArrayPipe
  ],
  providers: [
    AuthInterceptorProvider,
    EnvServiceProvider,
    {
      provide: NZ_I18N, useValue: en_US
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
