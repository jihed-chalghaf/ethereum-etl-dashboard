import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { CrudService } from 'src/app/services/crud.service';
import {API_URL, USERS, SUBSCRIPTION} from "../../../../globals/global_variables";
import { Router } from '@angular/router';
import { Subscription } from 'src/app/models/subscription.model';
import { SocketioService } from 'src/app/services/socketio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {

  currentUser: User = new User();
  currentSubscription: Subscription = new Subscription();
  subscriptionToCreate: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private crudService: CrudService,
    private router: Router,
    private socketioService: SocketioService
  ) { }

  ngOnInit(): void {
    // fetch profile from back
    this.crudService.getOne(API_URL+ USERS, this.userService.getCurrentUser().id).subscribe(
      (res) =>{
        this.currentUser = res;
        this.currentSubscription = this.currentUser.subscription;
        this.initializeForm();
      }
    );
    this.subscriptionToCreate= this.formBuilder.group({
      blockchain_url: '',
      contract_address: '',
      event_topic: ''
    });
  }

  initializeForm(){
    this.subscriptionToCreate.controls['blockchain_url'].setValue(this.currentUser.subscription?.blockchain_url);
    this.subscriptionToCreate.controls['contract_address'].setValue(this.currentUser.subscription?.contract_address);
    this.subscriptionToCreate.controls['event_topic'].setValue(this.currentUser.subscription?.event_topic);
  }

  submit(){
    console.log('submitted');
    const jsonSubscription = {
      id: this.currentSubscription.id,
      blockchain_url: this.subscriptionToCreate.value.blockchain_url,
      contract_address: this.subscriptionToCreate.value.contract_address,
      event_topic: this.subscriptionToCreate.value.event_topic
    };
    // display our subscription object for testing
    console.log("jsonSubscription => ", jsonSubscription);
    // call for update
    this.userService.updateSubscription(this.userService.getCurrentUser().id,jsonSubscription).subscribe(
      (result) =>{
        console.log(result);
        // update current user
        this.userService.saveUserLocally(result);
        // reinitiate the change stream with the new pipeline
        var currentUser = this.userService.getCurrentUser();
        var pipeline = {
          blockchain_url: currentUser.subscription.blockchain_url,
          contract_address: currentUser.subscription.contract_address,
          event_topic: currentUser.subscription.event_topic
        };
        // close the old changeStream and MongoClient connection
        this.socketioService.getSocketInstance().emit('closeChangeStreamAndDBConnection');
        // display an alert showing update success
        Swal.fire({
          text: 'Updated Successfully',
          icon: 'success',
          timer: 2000
        });
        // retrieve the current socket instance then emit the updateSubscription event to the server
        this.socketioService.updateSubscription(pipeline);
      },
      (error) => {
      //display an alert showing update failure
      Swal.fire({
        html: `Update Failed<br>error: ${error.error.message}`,
        icon: 'error',
        timer: 8000
      });
      }
    );
    this.router.navigate(['/dashboard', {previousUrl: 'subscribe'}]);
  }

}
