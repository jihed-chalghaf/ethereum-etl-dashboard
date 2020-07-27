import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Gender} from "../../../models/enum/Gender";
import {User} from "../../../models/user.model";
import {Profile} from "../../../models/profile.model";
import {Address} from "../../../models/address.model";
import {Country} from "../../../models/country.model";
import {DatePipe} from "@angular/common";
import {ImageService} from "../../../services/image.service";
import {UserService} from "../../../services/user.service";
import {CrudService} from "../../../services/crud.service";
import {API_URL, IMG_URL, USERS_PROFILE} from "../../../globals/global_variables";

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit {

  dateFormat = 'yyyy/MM/dd';
  profileToCreate: FormGroup;
  gender = Gender;
  fileData: any;
  imageEditClicked = false;
  currentUser: User = new User();
  currentProfile: Profile = new Profile();
  currentAddress: Address = new Address();
  currentCountry: Country = new Country();
  public image = null;
  pipe = new DatePipe('en-US');
  constructor(private formBuilder: FormBuilder,
              private imageService: ImageService,
              private userService: UserService,
              private crudService: CrudService,
              private router: Router) { }

  ngOnInit(): void {
    // fetch profile from back
    this.crudService.getOne(API_URL+ USERS_PROFILE, this.userService.getCurrentUser().id).subscribe(
      (res) =>{
        this.currentUser = JSON.parse(res.user);
        this.currentProfile = this.currentUser.profile;
        if (this.currentProfile){
          this.currentAddress = this.currentProfile.address;
          if(this.currentAddress){
            this.currentCountry = this.currentAddress.country;
            console.log(this.currentUser.username);
          }
        }
        this.initializeForm();
      }
    );
    this.profileToCreate= this.formBuilder.group({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      gender:'',
      number: '',
      birthday: '',
      street: '',
      city: '',
      postalCode: '',
    });
    // fetch current user image
    this.imageService.getImage().subscribe(
      (data) =>{
        this.image = IMG_URL + data;
      },
      error => {
        console.log(error);
        this.image = 'assets/img/theme/team-4-800x800.jpg';
      }
    )
  }
  setCountry(country){
    this.currentCountry.name=country.name;
    console.log(this.currentCountry.name);
  }
  initializeForm(){
    this.profileToCreate.controls['username'].setValue(this.currentUser.username);
    console.log('init'+this.profileToCreate.value.username);
    this.profileToCreate.controls['email'].setValue(this.currentUser.email);
    this.profileToCreate.controls['firstName'].setValue(this.currentUser.firstName);
    this.profileToCreate.controls['lastName'].setValue(this.currentUser.lastName);
    if (this.currentProfile){
      this.profileToCreate.controls['gender'].setValue(this.currentProfile.gender);
      this.profileToCreate.controls['number'].setValue(this.currentProfile.phoneNumber);
      if (this.currentAddress){
        this.profileToCreate.controls['street'].setValue(this.currentAddress.street);
        this.profileToCreate.controls['postalCode'].setValue(this.currentAddress.postal_code);
      }
    }
  }

  clickedTrue(){
    this.imageEditClicked = true;
  }

  fileEvent(e) {
    this.fileData = e.target.files[0];
    console.log(this.fileData);
  }

  submit(){
    console.log('submitted');
    if(this.profileToCreate.value.birthday){
      this.profileToCreate.value.birthday = this.pipe.transform(this.profileToCreate.value.birthday, ' yyyy-M-d hh:mm:ss');
    }
    const jsonUser = {
      user : {
        username: this.profileToCreate.value.username,
        email: this.profileToCreate.value.email,
        firstName: this.profileToCreate.value.firstName,
        lastName: this.profileToCreate.value.lastName,
        profile: {
          gender: this.profileToCreate.value.gender,
          phoneNumber: this.profileToCreate.value.number,
          birthDate: this.profileToCreate.value.birthday,
          address: {
            street: this.profileToCreate.value.street,
            postal_code: this.profileToCreate.value.postalCode,
            city: this.profileToCreate.value.city,
            country: {
              name: this.currentCountry.name
            }
          }
        }
      }
    };
    // call for update
    this.crudService.update(API_URL+USERS_PROFILE,this.userService.getCurrentUser().id,jsonUser).subscribe(
      (result) =>{
        console.log(result.body.user);
        // update current user
        this.userService.saveUserLocally(result);
      }
    );
    // post image
    if(this.fileData){
      this.imageService.postImage(this.fileData).subscribe(data => {
        console.log(data);
      });
    }
    this.router.navigate(['/user-profile']);
  }

}