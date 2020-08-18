import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { CrudService } from 'src/app/services/crud.service';
import {API_URL, USERS, SUBSCRIPTION} from "../../../../globals/global_variables";
import { Router } from '@angular/router';
import { Subscription } from 'src/app/models/subscription.model';

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
    private router: Router
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
      contract_address: '',
      event_topic: ''
    });
  }

  initializeForm(){
    this.subscriptionToCreate.controls['contract_address'].setValue(this.currentUser.subscription?.contract_address);
    this.subscriptionToCreate.controls['event_topic'].setValue(this.currentUser.subscription?.event_topic);
  }

  submit(){
    console.log('submitted');
    const jsonSubscription = {
      id: this.currentSubscription.id,
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
      }
    );
    this.router.navigate(['/dashboard']);
  }

}
