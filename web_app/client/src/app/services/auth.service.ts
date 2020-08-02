import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Router } from '@angular/router';
import { LocalService } from './local.service';
import { USERS } from './../globals/global_variables';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private http: HttpClient,
    private envService: EnvService,
    private router: Router,
    private localService: LocalService
  ) { }

  corsHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000/'
  });

  login(user: User) {
    const credentials = {email: user.email, password: user.password};
    console.log("credentials => ", JSON.stringify(credentials));
    //let headers: HttpHeaders = new HttpHeaders();
    //headers.append('Content-Type', 'application/json');
    //this.corsHeaders.append('No-Auth', 'True');
    return this.http.post(
      `${this.envService.apiUrl}/login`,
      // was JSON.stringify(credentials) but mock server doesn't want string, it accepts json object
       credentials
    );
  }

  logout(){
    
    return this.http.post(`${this.envService.apiUrl}/logout`,{})
    .pipe(
      tap(response=>{
        this.router.navigate(['/auth/login']);
      })
    );
  }

  signup(user: User) {
    //let headers: HttpHeaders = new HttpHeaders();
    //headers.append("No-Auth", "True");
    this.corsHeaders.append('No-Auth', 'True');
    return this.http.post<User>(`${this.envService.apiUrl + USERS}`, user);
  }

  isLogged() {
    return this.localService.getJsonValue('token') != null;
  }

}