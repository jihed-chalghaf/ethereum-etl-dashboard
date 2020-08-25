import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { SocketioService } from './services/socketio.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'eth_etl_dashboard';
  currentUser: User;

  constructor(
    private userService: UserService,
    private socketioService: SocketioService
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if(this.currentUser && this.currentUser.subscription && this.socketioService.getSocketInstance() == null) {
      // recreate socket instance, since user is connected and has a subscription
      console.log(`whoops, there's no socket connection .. :(, creating ...`);
      var pipeline = {
        contract_address: this.currentUser.subscription.contract_address,
        event_topic: this.currentUser.subscription.event_topic
      };
      this.socketioService.setupSocketConnection(pipeline);
      console.log(`wohoo, socket created successfully`);
    }
  }
}
