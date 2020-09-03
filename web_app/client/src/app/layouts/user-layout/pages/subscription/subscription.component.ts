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
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {

  currentUser: User = new User();
  currentSubscription: Subscription = new Subscription();
  //subscriptionToCreate: FormGroup;
  subscriptions: any[];
  currentPage: number;
  sizePage: number;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private crudService: CrudService,
    private router: Router,
    private socketioService: SocketioService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // fetch profile from back
    this.currentPage = 1;
    this.sizePage = 4;
    let params: any;
    const selectedPage = this.currentPage ;
    this.crudService.getOne(API_URL+ USERS, this.userService.getCurrentUser().id).subscribe(
      (res) => {
        this.currentUser = res;
        this.currentSubscription = this.currentUser.subscription;
        // get the subscriptions array from nedb
        params = new HttpParams().set('page', selectedPage.toString())
        .set('perPage', this.sizePage.toString());
        this.crudService.getAllWithParams(`${API_URL + USERS}/${this.currentUser.id + SUBSCRIPTIONS}`, params).subscribe(
          (subs) => {
            this.subscriptions = subs.subscriptions;
            console.log("SUBS => ", this.subscriptions);
            //this.initializeForm();
          }
        );
      }
    );
    /*this.subscriptionToCreate= this.formBuilder.group({
      blockchain_url: '',
      contract_address: '',
      event_topic: ''
    });*/
  }

  /*initializeForm(){
    this.subscriptionToCreate.controls['blockchain_url'].setValue(this.currentUser.subscription?.blockchain_url);
    this.subscriptionToCreate.controls['contract_address'].setValue(this.currentUser.subscription?.contract_address);
    this.subscriptionToCreate.controls['event_topic'].setValue(this.currentUser.subscription?.event_topic);
  }*/

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
                timer: 2000
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
      )
  }

  addSubscription(subscription) {
    this.userService.addSubscription(this.userService.getCurrentUser().id, subscription);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message);
  }

}
