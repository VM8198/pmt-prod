import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { config } from '../config';
import {AlertService} from './alert.service';
import { ToastrService } from 'ngx-toastr';
import { Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  @Output() notificationCount = new EventEmitter();

  constructor(public alert:AlertService,public http:HttpClient,
    private angularFireDB: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging,
    private toastr: ToastrService
    ) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      })
  }

  updateToken(userId, token) {
    // we can change this function to request our backend service
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        const data = {};
        data[userId] = token;
        this.angularFireDB.object('fcmTokens/').update(data);

        console.log("updated token",data);
      })
  }

  requestPermission(userId) {

    if ('Notification' in window) {
      console.log('supported'); } else {
        console.log(' not supported'); }
        this.angularFireMessaging.requestToken.subscribe(
          (token) => {
            console.log(token);
            console.log(userId);
            const udata={
              userId:userId,
              token:token
            }
            
            this.addEntry(udata);
            // this.addNotification(udata);

            //this.updateToken(userId, token);
          },
          (err) => {
            // console.error('Unable to get permission to notify.', err);
          });
      }

      receiveMessage() {
        this.angularFireMessaging.messages.subscribe(
          (payload:any) => {
            this.notificationCount.emit('notificationCount');
            console.log("new message received. ", payload);
            console.log("pylod======>",payload.notification.body);
            // console.log(payload.from);
            // this.currentMessage.next(payload);
            if (payload.notification.body == "comment") {
              
              this.toastr.error(payload.notification.title, "", {
                disableTimeOut: true,
                closeButton: true,
                enableHtml: true,
                
              });
            }
            else if (payload.notification.body == "other") {
              this.toastr.success(payload.notification.title, "", {
                disableTimeOut: true,
                closeButton: true,
                enableHtml: true
              });
            }else if (payload.notification.body == "task") {
              this.toastr.info(payload.notification.title, "", {
                disableTimeOut: true,
                closeButton: true,
                enableHtml: true
              });
            }else{
              this.toastr.warning(payload.notification.title, "", {
                disableTimeOut: true,
                closeButton: true,
                enableHtml: true
              });
            }
          })
      }

      addEntry(udata){
        console.log("notification data",udata);
        this.http.post(config.baseApiUrl+"notification/addUser",udata).subscribe((success) => {
        });
      }



    }
