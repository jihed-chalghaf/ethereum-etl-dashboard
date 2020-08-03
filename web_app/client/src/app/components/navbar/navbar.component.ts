import { Component, OnInit, ElementRef, DoCheck } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ImageService } from 'src/app/services/image.service';
import { IMG_URL } from 'src/app/globals/global_variables';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, DoCheck {
  public connected = false;
  public focus;
  public listTitles: any[];
  public location: Location;
  isLogged: Boolean;
  currentUser: User;
  public image;
  constructor(
    location: Location,  
    private element: ElementRef, 
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private imageService: ImageService,
    private localService: LocalService
    ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    this.connected = this.authService.isLogged();
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser);
    this.isLogged = this.authService.isLogged();
    this.imageService.getImage().subscribe(
      (data) => {
        console.log('data: ' + data);
        console.log(IMG_URL + data);
        this.image = IMG_URL + data; // environment.apiUrl+'/img/'+
      },
      error => {
        console.log(error);
        this.image = 'assets/img/theme/team-4-800x800.jpg';
      }
    );
  }

  ngDoCheck() {
    this.connected = this.authService.isLogged();
  }

  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Dashboard';
  }

  logout(){
    this.authService.logout().subscribe(
      (res) => {
        console.log('logging out');
        // clear data from localStorage
        this.localService.clearToken();
        this.isLogged = false;
        this.image = null;
        this.currentUser = null;
        this.router.navigate(['/']);
      }
    );
  }

}
