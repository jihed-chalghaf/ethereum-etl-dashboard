import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket: SocketIOClient.Socket;

  constructor() { }

  setupSocketConnection(subscription) {
    // proceed with the socket connection
    console.log("subscription @ socketio Service => ", subscription);
    this.socket = io(environment.apiUrl, {
      //'forceNew':true,
      query: {
        subscription: JSON.stringify(subscription)
      } 
    });
  }

  updateSubscription(subscription) {
    //this.socket = io(environment.apiUrl);
    this.socket.emit('updateSubscription', subscription);
  }

  getSocketInstance() {
    return this.socket;
  }
}
