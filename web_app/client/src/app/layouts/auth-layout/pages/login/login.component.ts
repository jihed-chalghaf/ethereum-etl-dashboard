import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SocketioService } from 'src/app/services/socketio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  user: User;
  error = false;
  textError = '';
  notifications = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private socketioService: SocketioService
  ) {}

  ngOnInit() {
  }
  ngOnDestroy() {
  }
  
  displayNotification(event) {
    this.notifications.push({
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
    });
    console.log("NOTIFICATIONS => ", this.notifications);
    Swal.mixin({
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
    })
    .queue(this.notifications)
    .then(() => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'All done!',
        confirmButtonText: 'Great'
      });
      this.notifications = [];
    });
  }

  startChangeStream() {
    var currentUser = this.userService.getCurrentUser();
    var pipeline = {
      contract_address: currentUser.subscription.contract_address,
      event_topic: currentUser.subscription.event_topic
    };
    this.socketioService.setupSocketConnection(pipeline);
    this.socketioService.getSocketInstance().on('newEvent', (event) => {
      console.log("## NEW EVENT DETECTED ## => ", event);
      // display a notification using sweetalert2
      this.displayNotification(event);
    });
  }

  login(form: NgForm) {
    console.log('login process starting..');
    if(!this.authService.isLogged()) {
      this.user = new User();
      this.user.email = form.controls.email.value;
      this.user.password = form.controls.password.value;
      console.log('##User## => ', this.user);
      this.authService.login(this.user).subscribe(
        (result) => {
          console.log("RESULT => ", result);
          this.error = false;
          this.userService.saveTokenLocally(result);
          this.userService.saveUserLocally(result);
          var redirectRoute = null;
          // redirecting after login success
          if(this.userService.getCurrentUser().role.toUpperCase() === 'USER')
          {
            redirectRoute = '/user-profile';
          }
          else if(this.userService.getCurrentUser().role.toUpperCase() === 'ADMIN')
          {
            redirectRoute = '/admin/users';
          }
          if(redirectRoute) {
            this.router.navigateByUrl(redirectRoute)
            .then(() => {
              // navigation succeeded, now start the change stream and listen to it
              this.startChangeStream();
            })
            .catch(err => console.log("Error => ", err));
          }
        },
        (err) => {
          this.error = true;
          if(err.status === 406) {
            this.textError = 'Invalid email or password';
          } else if(err.status === 401) {
            this.textError = 'Incorrect email or password';
          } else {
            this.textError = 'Error';
          }
        }
      );
    }
  }

}
