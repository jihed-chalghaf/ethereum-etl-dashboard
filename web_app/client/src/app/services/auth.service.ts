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
    return this.http.post(
      `${this.envService.apiUrl}/login`,
       credentials,
       {observe: 'response'}
    );
  }

  logout(){
    return this.http.post(`${this.envService.apiUrl}/logout`,{observe: 'response'});
  }

  signup(user: User) {
    this.corsHeaders.append('No-Auth', 'True');
    return this.http.post<User>(`${this.envService.apiUrl + USERS}`, user, {observe: 'response'});
  }

  isLogged() {
    return this.localService.getJsonValue('token') != null;
  }

}
