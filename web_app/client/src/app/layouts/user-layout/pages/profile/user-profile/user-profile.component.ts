import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import {IMG_URL} from '../../../../../globals/global_variables';
import { UserService } from 'src/app/services/user.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  currentUser: User;
  image: string;
  constructor(
    private userService: UserService,
    private imageService: ImageService
  ) { }

  ngOnInit() {
    this.imageService.getImage().subscribe(
      (data) => {
        this.image = IMG_URL + data;
      },
      error => {
        console.log(error);
        this.image = 'assets/img/theme/default_profile_pic.jpeg';
      }
    );
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser.username);
  }

}