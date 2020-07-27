import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpParams, HTTP_INTERCEPTORS, HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {LocalService} from '../services/local.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private localService: LocalService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // console.log('in interceptor', this.authenticationService.isLogged());
    if(this.authService.isLogged()) {
      const newRequest = request.clone(
        {
          headers: request.headers.append(
            'Authorization', 'Bearer '+ this.localService.getJsonValue('token')
          )
        }
      );
      // console.log('request',newRequest);
      return next.handle(newRequest);

    }else {
      return next.handle(request);
    }
  }
}
export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};