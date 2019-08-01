import { Component, OnInit, HostListener} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AlertService } from '../services/alert.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import * as _ from 'lodash';
declare var $ : any;
import { config } from '../config';
import{LeaveService} from '../services/leave.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js';



@Component({
	selector: 'app-visit-user-profile',
	templateUrl: './visit-user-profile.component.html',
	styleUrls: ['./visit-user-profile.component.css']
})
export class VisitUserProfileComponent implements OnInit {
	projects;
	developers;
	path = config.baseMediaUrl;
	userId;
	url = '';
	user;
	files;
	developerId =JSON.parse(localStorage.getItem('currentUser'))._id;
	projectArr = [];
	finalArr = [];
	editTEmail;
	currentUser = JSON.parse(localStorage.getItem('currentUser'))._id;
	baseMediaUrl = config.baseMediaUrl;
	singleleave:any;
	loader : boolean = false;
	leaveApp:any;
	leaves:any;
	leavescount:any;
	approvedLeaves:any = [];
	Half_Day = [];
	Full_Day = [];
	More_Day = [];
	Personal_Leave :any= [];
	Sick_Leave :any= [];
	Emergency_Leave :any= [];
	Leave_WithoutPay :any= [];

	constructor(private route: ActivatedRoute,public _alertService: AlertService,
		private router: Router, public _projectService: ProjectService,
		public _loginService: LoginService, public _leaveService:LeaveService) { 
	}

	getEmptytracks(){

		this.leavescount = [
		{
			"typeOfLeave" : "Sick_Leave",
			"leavesTaken" : Number()
		},
		{
			"typeOfLeave" : "Personal_Leave",
			"leavesTaken" : Number()
		},
		{
			"typeOfLeave" : "Leave_WithoutPay",
			"leavesTaken" : Number()
		},
		{
			"typeOfLeave" : "Emergency_Leave",
			"leavesTaken" : Number()
		},
		{
			"leavesPerYear" : 18,
			"leavesLeft" : 18 
		}  
		]
		console.log("leaves+++++++++++++++=",this.leavescount);
	}
	ngOnInit() {
		
		this.route.params.subscribe(param=>{
			this.developerId = param.id;
			console.log("developers id",this.developerId);
			this.getDeveloperById(this.developerId);
		});
		// this.leaveByUserId(this.currentUser.email);
		this.leaveByUserId(this.developerId);
		this.getLeave(this.developerId);
	}
	getDeveloperById(id){

		this.loader = true;
		console.log("id=>>>",id);
		this._loginService.getUserById(id).subscribe((res:any)=>{
			this.currentUser = res;
			console.log("current developer=============>",this.currentUser);
			this._projectService.getProjects().subscribe(res=>{
				console.log("total number of projects =====>" , res);
				this.projects = res;
				_.forEach(this.projects , (task)=>{
					_.forEach(task.Teams , (project)=>{
						if(project._id == this.developerId){
							this.projectArr.push(task);
						}
					})
				})
				for(var i=0;i<this.projects.length;i++){
					this.finalArr.push(this.projectArr[i]);
					console.log("response======>",this.finalArr);
				}	
				this.loader = false;
			}

			)},(err:any)=>{
				console.log("eroooooor=========>",err);
			})
		
	}
	leaveByUserId(id){
		this._loginService.getUserById(id).subscribe((res:any)=>{
			this.currentUser = res;
			console.log("current developer=============>",this.currentUser);

			console.log("leave id=======>>",this.currentUser.email);
			this._leaveService.leaveByUserId(this.currentUser.email).subscribe((res:any)=>{
				console.log("======>>>",res);
				this.leaveApp = res;
				console.log("single leave",this.leaveApp);
				this.leaves = this.leaveApp;
			},err=>{
				console.log("errrrrrrrrrrrrr",err);
			})

		})
	}
	getLeave(id){
		this._loginService.getUserById(id).subscribe((res:any)=>{
			this.currentUser = res;
			console.log("current developer=============>",this.currentUser);

			console.log("leave id=======>>",this.currentUser.email);
			this._leaveService.leaveByUserId(this.currentUser.email).subscribe((res:any)=>{
				console.log("======>>>",res);
				this.leaveApp = res;
				console.log("single leave",this.leaveApp);
				// var approvedLeaves:any = [];
				_.forEach(this.leaveApp,(leave)=>{
					// console.log('leaves==========>',leave);
					if(leave.status == "approved"){
						// console.log('leavessssssssssss==========>',leave);
						this.approvedLeaves.push(leave)
					}
				});
				console.log('approvedLeaves',this.approvedLeaves);
				this.getEmptytracks();
				var ctxP = document.getElementById("pieChart");
				var myPieChart = new Chart(ctxP, {
					type: 'pie',
					data: {
						labels: [ "Personal Leave","Sick leave(Illness or Injury)","Emergency leave","Leave without pay"],
						datasets: [{
							data: this.getLeaveCount(this.approvedLeaves),
							backgroundColor: ["#181123", "#3998c5", "#91b9cc", "#cacbcc"],
							hoverBackgroundColor: ["gray", "gray", "gray", "gray"]
						}]
					},
					options: {
						responsive: true,
						legend:{
							position:"right",
							labels:{
								boxWidth:12
							}
						}
					}
				});
				var ctxP = document.getElementById("pieChart1");
				var myPieChart = new Chart(ctxP, {
					type: 'pie',
					data: {
						labels: ["Half Day", "Full Day", "More Day"],
						datasets: [{
							data:this.getLeaveDuration(this.approvedLeaves),
							backgroundColor: ["#181123", "#3998c5", "#91b9cc"],
							hoverBackgroundColor: ["gray", "gray", "gray"]
						}]
					},
					options: {
						responsive: true,
						legend:{
							position:"right",
							labels:{
								boxWidth:12,
								// usePointStyle:true,
							}
						}
					}
				})
				_.forEach(this.leaveApp , (leave)=>{
					_.forEach(this.leavescount , (count)=>{
						if(count.typeOfLeave == leave.typeOfLeave && leave.status == "approved"){
							count.leavesTaken = count.leavesTaken + 1;
						}
					});
				});
				console.log( this.leavescount[4].leavesLeft = this.leavescount[4].leavesLeft-(this.leavescount[3].leavesTaken+this.leavescount[2].leavesTaken+this.leavescount[1].leavesTaken+this.leavescount[0].leavesTaken));
				console.log("leaves count ====>" , this.leavescount);

			},err=>{
				console.log("errrrrrrrrrrrrr",err);
			})
		})
	}
	getLeaveCount(leaves){
		console.log("all p_leave=====",leaves);
		// console.log("attt====>",leaves[0].attechment);
		_.forEach(leaves,(leave)=>{
			switch (leave.typeOfLeave) {
				case "Personal_Leave":
				this.Personal_Leave.push(leave);
				break;
				case "Sick_Leave":
				this.Sick_Leave.push(leave);
				break;
				case "Emergency_Leave":
				this.Emergency_Leave.push(leave);
				break;
				case "Leave_WithoutPay":
				this.Leave_WithoutPay.push(leave);
				break;
			}
		});
		console.log(this.Personal_Leave.length, this.Sick_Leave.length, this.Emergency_Leave.length, this.Leave_WithoutPay.length);
		return [ this.Personal_Leave.length, this.Sick_Leave.length, this.Emergency_Leave.length, this.Leave_WithoutPay.length ];
	}
	getLeaveDuration(leaves){
		console.log(leaves);
		console.log(leaves[1].attechment);
		
		_.forEach(leaves,(leave)=>{
			switch (leave.leaveDuration) {
				case "0.5":
				this.Half_Day.push(leave);
				break;
				case "1":
				this.Full_Day.push(leave);
				break;
				default :
				this.More_Day.push(leave);
				break; 
			}
		})
		console.log(this.Half_Day.length,this.Full_Day.length,this.More_Day.length);
		return [this.Half_Day.length,this.Full_Day.length,this.More_Day.length];
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
}
// this Component is created for guest-user who can visit all team members profile....


