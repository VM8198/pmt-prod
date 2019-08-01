import { Component, OnInit } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
// import {ProjectService} from '../services/project.service';
import{LeaveService} from '../services/leave.service';
import { AlertService } from '../services/alert.service';
import * as moment from 'moment';
import * as _ from 'lodash';
declare var $ : any;
import Swal from 'sweetalert2';
import { config } from '../config';


@Component({
	selector: 'app-myleave',
	templateUrl: './myleave.component.html',
	styleUrls: ['./myleave.component.css']
})
export class MyleaveComponent implements OnInit {
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	singleleave:any;
	leaveApp:any;
	leavesToDisplay:boolean = false;
	constructor(public router:Router, public _leaveService:LeaveService,
		public _alertService: AlertService,private route: ActivatedRoute) { }

	ngOnInit() {
		this.leaveByUserId(this.currentUser.email);
	}


	leaveByUserId(email){
		console.log("leave id=======>>",email);
		this._leaveService.leaveByUserId(email).subscribe((res:any)=>{
			console.log("======>>>",res);
			this.leaveApp = res;
			console.log("single leave",this.leaveApp);
		},err=>{
			console.log("errrrrrrrrrrrrr",err);
		})
	}

	leaveById(leaveid){
		console.log("leave id=======>>",leaveid);
		this._leaveService.getbyId(leaveid).subscribe((res:any)=>{
			this.singleleave = res[0];
			console.log("single leave",this.singleleave);
		},err=>{
			console.log("errrrrrrrrrrrrr",err);
		})
	}

	gotAttachment = [];
	sendAttachment(attechment){
		console.log("attachment is====>",attechment);
		this.gotAttachment = attechment;
		$('#veiwAttach').modal('show')
		console.log("gotattechment array ====>",this.gotAttachment);
	}

}
