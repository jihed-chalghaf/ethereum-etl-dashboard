import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "../models/user.model";
import { EnvService } from './env.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
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