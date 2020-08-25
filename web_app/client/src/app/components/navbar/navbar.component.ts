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
import { SocketioService } from 'src/app/services/socketio.service';
import Swal from 'sweetalert2';

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
  events = [];

  constructor(
    location: Location,  
    private element: ElementRef, 
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private imageService: ImageService,
    private localService: LocalService,
    private socketioService: SocketioService
    ) {
    this.location = location;
  }

  displayNotification(event) {
    Swal.fire({
      position: 'top-end',
      icon: 'info',
      title: '<strong>A new event has been detected</strong>',
      html: `<strong>contract address:</strong> ${event.address}<br>` + 
            `<strong>event topic:</strong> ${event.topics[0]}<br>` +
            `<strong>sender address:</strong> ${event.result[0]}<br>` +
            `<strong>reciever address:</strong> ${event.result[1]}<br>` +
            `<strong>amount:</strong> ${event.result[2]}`,
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Got it!',
    }).then(() => {
      this.events = this.events.filter(obj => obj !== event);
    });
  }

  startChangeStream() {
    var pipeline = {
      contract_address: this.currentUser.subscription.contract_address,
      event_topic: this.currentUser.subscription.event_topic
    };
    this.socketioService.setupSocketConnection(pipeline);
    this.socketioService.getSocketInstance().on('newEvent', (event) => {
      console.log("## NEW EVENT DETECTED ## => ", event);
      // display a notification using sweetalert2
      this.events.push(event);
    });
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    this.connected = this.authService.isLogged();
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser);
    this.isLogged = this.authService.isLogged();
    if(this.isLogged) {
      this.startChangeStream();
    }
    this.imageService.getImage().subscribe(
      (data) => {
        console.log('data: ' + data);
        console.log(IMG_URL + data);
        this.image = IMG_URL + data; // environment.apiUrl+'/img/'+
      },
      error => {
        console.log(error);
        this.image = 'assets/img/theme/default_profile_pic.jpeg';
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
        this.router.navigate(['/auth/login']);
        this.socketioService.getSocketInstance().emit('disconnect');
      }
    );
  }

}
