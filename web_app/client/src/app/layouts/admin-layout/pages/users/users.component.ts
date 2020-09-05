import { Component, OnInit } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {HttpParams} from '@angular/common/http';
import {User} from '../../../../models/user.model';
import {CrudService} from '../../../../services/crud.service';
import {API_URL, USERS} from '../../../../globals/global_variables';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  currentPage: number;
  sizePage: number;
  users: User[];
  users_in_current_page: any[] = [];
  constructor( private _snackBar: MatSnackBar, private crudService: CrudService) { }

  ngOnInit(): void {
    this.currentPage = 1;
    this.sizePage = 4;
    this.retrieveUsers();
  }

  retrieveUsers() {
    const selectedPage = this.currentPage ;
    this.crudService.getAll(API_URL + USERS).subscribe(
      (response) => {
        this.users = response;
        this.currentPage = 1;
        console.log('*******************************');
        console.log(this.users);
        this.setUsersPerPage();
      },
      (error =>  {
        console.log(error);
      })
    );
  }

  deleteUser(user) {
    this.crudService.delete(API_URL + USERS, user._id).subscribe(res => {
      alert('User deleted successfully');
      user.deleted = true;
    }, error => {
      alert(`Couldn't delete user`);
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message);
  }

  paginate(page_nb) {
    console.log(page_nb);
    this.currentPage = page_nb;
    this.setUsersPerPage();
    console.log(this.users_in_current_page);
  }

  setUsersPerPage() {
    this.users_in_current_page = [];
    for(let i = (this.currentPage - 1)* this.sizePage,j = 0; i < this.currentPage * this.sizePage; i++) {
      if(this.users[i]) {
        this.users_in_current_page[j] = this.users[i];
        j++;
      }
    }
  }
}