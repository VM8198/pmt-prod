// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, Output, Input, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {ProjectService} from '../services/project.service';
import{LeaveService} from '../services/leave.service';
import * as moment from 'moment';
import * as _ from 'lodash';
declare var $ : any;
import { config } from '../config';
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';
import { AlertService } from '../services/alert.service';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { AllLeaveAppComponent } from '../all-leave-app/all-leave-app.component';
import { MessagingService } from '../services/messaging.service';


@Component({
	selector: 'app-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
	@Input() acceptedLeave;

	userNotification:any;
	path = config.baseMediaUrl;
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	allLeaves;
	allAproveLeaves;
	leaves;
	projectId;
	leaveApp;
	rejectedLeave;
	developers;
	rejeLeaves;
	developer;
	projects;
	developerId;
	id;
	projectArr =[];
	finalArr = [];
	project;
	start;
	currentUserId;
	pmStatus;
	leaveFlag = false;
	constructor(public _messagingservice:MessagingService,public route:ActivatedRoute,public router:Router,
		public _projectservice: ProjectService,public _leaveService:LeaveService) {

	}

	ngOnInit() {
		this.get();
		this.getNotificationByUserId(this.currentUserId);
		console.log("leaveFlag ng onint:",this.leaveFlag);
	}
	get(){
		var currentUser = JSON.parse(localStorage.getItem('currentUser'));
		console.log("res-=-=",currentUser);
	}
	getNotificationByUserId(currentUserId){
		console.log("login user ",currentUserId);
		this._projectservice.getNotificationByUserId(this.currentUser._id).subscribe((res:any)=>{
			console.log("notification resp:",res);
			var loginUser = JSON.parse(localStorage.getItem('currentUser'));
			console.log("loginUser==========>",loginUser);
			this.userNotification = res;
			console.log("data==============>",this.userNotification);
			let name = this.userNotification.name;
			console.log("name of ommmmmmmmmmmm",name);
			this.userNotification.sort(custom_sort);
			this.userNotification.reverse();
			var start = new Date();
			start.setTime(1532403882588);
		})
		function custom_sort(a, b) {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		}
	}
	
	displayLeaveEmit(leave){
		console.log("leave ==>",leave);	
	}
	updateNotificationByStatus(leaveId,leaveStatus){
		Swal.fire({
			title: 'Are you sure?',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No',
			reverseButtons: true
		})
		.then((result) => {
			this._leaveService.updateNotificationByStatus(leaveId,leaveStatus).subscribe((res:any)=>{
				this.pmStatus = res.leaveStatus;
				console.log("pmStatus first:",res.pmStatus);
				var loginUserName ={ name : JSON.parse(localStorage.getItem('currentUser')).name};
				console.log("loginUserName:",loginUserName);
				for(let i=0; i<res.pmStatus.length;i++){
					if(res.pmStatus[i].leaveStatus == "approved"  || res.pmStatus[i].leaveStatus == "rejected" && res.pmStatus[i].pmanagerId == loginUserName.name){
						this.leaveFlag = true;
						$('.notification_button').css('cursor','auto');
					}
				}
				Swal.fire({
					title: 'Leave applied successfully',
					type: 'success',
					reverseButtons: true
				})
			},err=>{
				console.log(err);
				Swal.fire('Oops...', 'Something went wrong!', 'error')
			})
		})
	}

}

