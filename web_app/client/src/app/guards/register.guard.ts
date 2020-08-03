import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isLogged()) {
      // user is logged in
      // not authorized so redirect him to his profile and return false
      this.router.navigate(['/user-profile'], { queryParams: { returnUrl: state.url }});
      return false;
    }
    // no user logged in, return true
    return true;
  }
  
}
