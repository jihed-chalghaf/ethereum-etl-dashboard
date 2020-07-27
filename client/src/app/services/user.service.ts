import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "../models/user.model";
import { EnvService } from './env.service';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { USERS } from './../globals/global_variables';
import { LocalService } from './local.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private currentUser = new User();

  constructor(
    private http: HttpClient,
    private envService: EnvService,
    private router: Router,
    private localService: LocalService
  ) { }

  login(user: User) {
    const credentials = {email: user.email, password: user.password};
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('No-Auth', 'True');
    return this.http.post(
      `${this.envService.apiUrl}/login`,
       JSON.stringify(credentials),
       {headers}
       );
  }

  logout(){
    
    return this.http.post(`${this.envService.apiUrl}/logout`,{}).pipe(
      tap(response=>{
        this.router.navigate(['/login']);
      })
    );
  }

  signup(user: User) {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append("No-Auth", "True");

    return this.http.post<User>(`${this.envService.apiUrl + USERS}`, user, {
      headers
    });
  }

  isLogged() {
    return this.localService.getJsonValue('token') != null;
  }

  getUsers() {
    return this.http.get<User[]>(`${this.envService.apiUrl + USERS}`);
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.envService.apiUrl + USERS}/${id}`);
  }

  setCurrentUser(currentUser: User) {
    this.currentUser = new User();
    this.currentUser = currentUser;
  }

  getCurrentUser(): User {
    const user: User = this.localService.getJsonValue('currentUser');
    if(user != null) {
      this.setCurrentUser(user);
    }
    return this.currentUser;
  }

  updateUser(user: User) {
    return this.http.put<User>(`${this.envService.apiUrl + USERS}/${user.id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${this.envService.apiUrl + USERS}/${id}`);
  }

  saveUserLocally(result) {
    this.currentUser = new User();
    this.localService.setJsonValue('currentUser',JSON.parse(result.body.user));
    this.setCurrentUser(JSON.parse(result.body.user));
  }

  saveTokenLocally(result) {
    this.localService.setJsonValue('token',result.body.token);
  }
}