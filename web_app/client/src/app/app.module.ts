import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { EnvServiceProvider } from './services/env.service.provider';
import { AuthInterceptorProvider } from './interceptors/auth.interceptor';
import { NgZorroAntdModule, en_US, NZ_I18N } from 'ng-zorro-antd';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SocketioService } from './services/socketio.service';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    NgZorroAntdModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    UserLayoutComponent
  ],
  providers: [
    AuthInterceptorProvider,
    EnvServiceProvider,
    {
      provide: NZ_I18N, useValue: en_US
    },
    SocketioService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
