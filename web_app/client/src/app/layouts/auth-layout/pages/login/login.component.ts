import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  user: User;
  error = false;
  textError = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
  }
  ngOnDestroy() {
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
              var currentUser = this.userService.getCurrentUser();
              var pipeline = {
                contract_address: currentUser.subscription.contract_address,
                event_topic: currentUser.subscription.event_topic
              };
              this.userService.initChangeStream(currentUser.id, pipeline)
              .subscribe(res => {
                console.log("##NEW EVENT DETECTED## => ", res.body.event_data);
              });
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
