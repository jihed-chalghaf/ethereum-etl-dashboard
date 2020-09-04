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
import { KeysPipe } from 'src/app/pipes/keys.pipe';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [KeysPipe]
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
  tableStyle = "border: 1px solid black;border-collapse: collapse;margin-left: -25px;"
  thStyle = "border: 1px solid black;border-collapse: collapse;padding: 5px;text-align: middle;background-color: #03a9fc;color: white;";
  tdStyle = "border: 1px solid black;border-collapse: collapse;padding: 5px;";
  trStyle = "background-color: #f2f2f2;"
  private clicked: Boolean = false;
  private event: any;
  private rows = '';

  constructor(
    location: Location,  
    private element: ElementRef, 
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private imageService: ImageService,
    private localService: LocalService,
    private socketioService: SocketioService,
    private keys: KeysPipe
    ) {
    this.location = location;
  }

  toggleDisplay() {
    this.clicked = !this.clicked;
  }

  displayNotif(event) {
    this.event = event.result;
    this.toggleDisplay();
    console.log(event);
    this.events = this.events.filter(obj => obj !== event);
  }

  prepareParams(event) {
    this.rows = '';
    for(let index=0; index < event.result['_length_']; index ++) {
      this.rows = this.rows + 
      `<tr style="${this.trStyle}">
        <td style="${this.tdStyle}">${index}</td>
        <td style="${this.tdStyle}">${event.result[index]}</td>
      </tr>`
    }
  }

  displayNotification(event) {
    this.prepareParams(event);
    Swal.fire({
      //position: 'top-end',
      icon: 'info',
      title: '<strong>A new event has been detected</strong>',
      html: `<strong>event topic:</strong> ${event.topics[0]}<br><br>` +
            `<strong>event parameters:</strong>
             <table style="${this.tableStyle}">
              <tr>
                <th style="${this.thStyle}">Id</th>
                <th style="${this.thStyle}">Value</th>
              </tr>
              ${this.rows}
             </table>`,
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Got it!',
    }).then(() => {
      this.events = this.events.filter(obj => obj !== event);
    });
  }

  startChangeStream() {
    var pipeline = {
      blockchain_url: this.currentUser.subscription.blockchain_url,
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
    this.keys = new KeysPipe();
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    this.connected = this.authService.isLogged();
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser);
    this.isLogged = this.authService.isLogged();
    if(this.isLogged && this.currentUser.subscription) {
      console.log('[i] Starting change stream..');
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
        // close socket connection if the current user is subscribed
        if(this.currentUser.subscription) {
          console.log('[i] Closing changeStream, DB connection and socket connection..');
          this.socketioService.getSocketInstance().emit('closeChangeStreamAndDBConnection');
          this.socketioService.getSocketInstance().emit('close');
        }
        // clear data from localStorage
        this.localService.clearToken();
        this.isLogged = false;
        this.image = null;
        this.currentUser = null;
        this.router.navigate(['/auth/login']);
      }
    );
  }
}
