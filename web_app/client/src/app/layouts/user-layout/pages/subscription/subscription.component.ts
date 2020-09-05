import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { CrudService } from 'src/app/services/crud.service';
import {API_URL, USERS, SUBSCRIPTION, SUBSCRIPTIONS} from "../../../../globals/global_variables";
import { Router } from '@angular/router';
import { Subscription } from 'src/app/models/subscription.model';
import { SocketioService } from 'src/app/services/socketio.service';
import Swal from 'sweetalert2';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {

  currentUser: User = new User();
  currentSubscription: Subscription = new Subscription();
  subscriptions: any[];
  currentPage: number;
  sizePage: number;
  clicked: Boolean;
  new_subscription: any;
  subs_in_current_page: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private crudService: CrudService,
    private router: Router,
    private socketioService: SocketioService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.clicked = false;
    this.new_subscription = {
      blockchain_url: '',
      contract_address: '',
      event_topic: ''
    };
    // fetch profile from back
    this.currentPage = 1;
    this.sizePage = 4;
    this.crudService.getOne(API_URL+ USERS, this.userService.getCurrentUser().id).subscribe(
      (res) => {
        this.currentUser = res;
        this.currentSubscription = this.currentUser.subscription;
        // get the subscriptions array from nedb
        this.crudService.getAll(`${API_URL + USERS}/${this.currentUser.id + SUBSCRIPTIONS}`).subscribe(
          (subs) => {
            this.subscriptions = subs.subscriptions;
            console.log("SUBS => ", this.subscriptions);
            this.setSubsPerPage();
          }
        );
      }
    );
  }

  setSubsPerPage() {
    this.subs_in_current_page = [];
    for(let i = (this.currentPage - 1)* this.sizePage,j = 0; i < this.currentPage * this.sizePage; i++) {
      if(this.subscriptions[i]) {
        this.subs_in_current_page[j] = this.subscriptions[i];
        j++;
      }
    }
  }

  deactivateSubscription() {
    const jsonSubscription = {
      id: this.currentSubscription.id,
      blockchain_url: '',
      contract_address: '',
      event_topic: ''
    };
    this.submit(jsonSubscription);
  }

  submit(subscription){
    console.log('submitted');
    const jsonSubscription = {
      id: this.currentSubscription.id,
      blockchain_url: subscription.blockchain_url,
      contract_address: subscription.contract_address,
      event_topic: subscription.event_topic
    };
    // display our subscription object for testing
    console.log("jsonSubscription => ", jsonSubscription);
    // call for update
    this.userService.updateSubscription(this.userService.getCurrentUser().id,jsonSubscription).subscribe(
      (result) =>{
        console.log(result);
        // update current user
        this.userService.saveUserLocally(result);
        // update subscriptions for the user
        this.subscriptions = result.body.subscriptions;
        console.log("SUBS => ", this.subscriptions);
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

  compareSubs(subscription) {
    return(
      subscription.blockchain_url == this.currentSubscription.blockchain_url && 
      subscription.contract_address == this.currentSubscription.contract_address &&
      subscription.event_topic == this.currentSubscription.event_topic
      );
  }

  deleteSubscription(subscription) {
    this.userService.deleteSubscription(this.currentUser.id, subscription)
      .subscribe(
        (result) =>{
          console.log(result);
          // update current user
          this.userService.saveUserLocally(result);
          console.log('user saved locally');
          // update subscriptions for the user
          this.userService.getSubscriptions(this.currentUser.id).subscribe(
            subs => {
              this.subscriptions = subs.subscriptions;
              console.log("SUBS => ", this.subscriptions);
              this.setSubsPerPage();
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
                text: 'Deleted Successfully',
                icon: 'success',
                timer: 3000
              });
              // retrieve the current socket instance then emit the updateSubscription event to the server
              this.socketioService.updateSubscription(pipeline);
            }
          );
        },
        (error) => {
        console.log(error);
        //display an alert showing update failure
        Swal.fire({
          html: `Delete Failed<br>error: ${error.error.message}`,
          icon: 'error',
          timer: 8000
        });
        }
      );
  }

  addSubscription() {
    this.userService.addSubscription(this.userService.getCurrentUser().id, this.new_subscription)
      .subscribe(
        result => {
          console.log(result.body);
          this.userService.getSubscriptions(this.currentUser.id).subscribe(
            subs => {
              this.subscriptions = subs.subscriptions;
              console.log("SUBS => ", this.subscriptions);
              this.setSubsPerPage();
              this.clicked = false;
              this.new_subscription['blockchain_url'] = this.new_subscription['contract_address'] = this.new_subscription['event_topic'] = '';
              console.log('new sub after reset', this.new_subscription);
              Swal.fire({
                text: 'Added Successfully',
                icon: 'success',
                timer: 3000
              });
            }
          );
        },
        error => {
          console.log(error);
          //display an alert showing update failure
          Swal.fire({
            html: `Add Failed<br>error: ${error.error.message}`,
            icon: 'error',
            timer: 8000
          });
        }
      );
  }

  toggleClick() {
    this.clicked = true;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message);
  }

  paginate(page_nb) {
    console.log(page_nb);
    this.currentPage = page_nb;
    this.setSubsPerPage();
    console.log(this.subs_in_current_page);
  }

}
