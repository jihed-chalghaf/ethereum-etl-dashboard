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
  constructor( private _snackBar: MatSnackBar, private crudService: CrudService) { }

  ngOnInit(): void {
    this.currentPage = 1;
    this.sizePage = 4;
    this.retreiveUsers();
  }

  retreiveUsers() {
    let params: any;
    const selectedPage = this.currentPage ;
    params = new HttpParams().set('page', selectedPage.toString())
      .set('perPage', this.sizePage.toString());
    this.crudService.getAllWithParams(API_URL + USERS, params).subscribe(
      (response) => {
        this.users = response;
        this.currentPage = 1;
        console.log('*******************************');
        console.log(this.users);
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
}