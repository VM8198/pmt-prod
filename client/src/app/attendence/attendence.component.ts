import { Component, OnInit, ViewChild,
	TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
	import {Router,ActivatedRoute} from '@angular/router';
	import{AttendenceService} from '../services/attendence.service';
	import { AlertService } from '../services/alert.service';
	import{LeaveService} from '../services/leave.service';
	import { startOfDay,endOfDay,subDays,addDays,endOfMonth,isSameDay,isSameMonth,addHours
	} from 'date-fns';
	import { Subject } from 'rxjs';
	import { ProjectService } from '../services/project.service';
	import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
	import { MatDatepickerModule, MatNativeDateModule } from "@angular/material";

	import {
		CalendarEvent,
		CalendarEventAction,
		CalendarEventTimesChangedEvent,
		CalendarView
	} from 'angular-calendar';
	import {FormControl} from '@angular/forms';
	import { DayViewHour } from 'calendar-utils';

	import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

	import * as moment from 'moment';
	import * as _ from 'lodash';
	declare var $ : any;
	import Swal from 'sweetalert2';
	import { config } from '../config';

	const colors: any = {
		red: {
			primary: '#ad2121',
			secondary: '#FAE3E3'
		},
		blue: {
			primary: '#1e90ff',
			secondary: '#D1E8FF'
		},
		yellow: {
			primary: '#e3bc08',
			secondary: '#FDF1BA'
		}
	};



	@Component({
		selector: 'app-attendence',
		templateUrl: './attendence.component.html',
		changeDetection: ChangeDetectionStrategy.OnPush,
		styleUrls: ['./attendence.component.css']
	})
	export class AttendenceComponent implements OnInit {
		searchText;
		logs;
		diff:any;
		maindiff=[];
		check:any;
		diffff:any;
		timediff:any;
		gate = [];
		arry=[];
		out:any;
		workdifference=[];
		worktime:any;
		attedenceByDateError;
		errMessage;
		loader : boolean = false;
		userid = [];
		presentid = [];
		usercheck:any;
		presentuser:any;
		from:any;
		absentuser:any;
		finalResultPresentUser = [];
		attendence:any;
		items;
		checkin = [];
		checkout = [];
		att=[];
		alldifference = [];
		modeldiff = [];
		missing:any;
		totaldifff:any;
		currentDate;
		endDate: any;
		developers:any;
		filteredDevelopers;
		attendenceByDate = [];
		select;
		alldiff=[];
		time:any;
		datedata1:any;
		datedata2:any;
		fullatt:any;
		currentUser = JSON.parse(localStorage.getItem('currentUser'));
		maxtime:any;
		finalDate1: any;
		finalDate2: any;

		view: string = 'month';

		viewDate: Date = new Date();

		events: CalendarEvent[] = [];

		clickedDate: Date;

		clickedColumn: number;

		hoveredDate: NgbDate;

		fromDate: NgbDate;
		toDate: NgbDate;

		constructor(calendar: NgbCalendar,public router:Router, public _leaveService:LeaveService,
			public _alertService: AlertService,private route: ActivatedRoute,private modal: NgbModal,
			public _projectService: ProjectService, public change: ChangeDetectorRef) {
			this.route.queryParams
			.subscribe(params=>{
				this.items = params;
				// this.dateSelected(this.items.date);
				this.currentDate = this.items.date;
				this.currentDate = moment(this.currentDate).format("DD-MM-YYYY");
				console.log("this is current date",this.currentDate);
				localStorage.setItem("attedenceByDateError",JSON.stringify(false));

			})

			this.fromDate = calendar.getToday();
			this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
		}

		ngOnInit() {


		$('.datepicker').pickadate({ 
			max: new Date(),
		})
			var from_input = $('#startingDate').pickadate(),
		from_picker = from_input.pickadate('picker')

		
		if ( from_picker.get('value') ) {
			console.log(from_picker.get('select'));
			to_picker.set('min', from_picker.get('select'))
		}
		
		from_picker.on('set', function(event) {
			if ( event.select ) {
				console.log(from_picker.get('select'));
				to_picker.set('min', from_picker.get('select'))
			}
			else if ( 'clear' in event ) {
				to_picker.set('min', false)
			}
		})

		
			$('#startingDate').pickadate({
				onSet: function (date1){
					console.log(date1);
					this.datedata1 = $('#startingDate').val();
					console.log(this.datedata1);
					this.worktime = '';
					this.isTable = true;
					console.log('this.worktime: ', this.worktime);
					$('#endingDate').removeAttr("disabled");
				}
			})

			var to_input = $('#startingDate').pickadate(),
		to_picker = to_input.pickadate('picker')

			if ( to_picker.get('value') ) {
			from_picker.set('max', to_picker.get('select'))
		}
		to_picker.on('set', function(event) {
			if ( event.select ) {
				from_picker.set('max', to_picker.get('select'))+1
			}
			else if ( 'clear' in event ) {
				from_picker.set('max', false)
			}
		})
		$('#endingDate').pickadate({
				onSet: function (date2){
					this.datedata2 = $('#endingDate').val();
					console.log(this.datedata1, this.datedata2);
					this.worktime = '';
					this.isTable = true;
					console.log('this.worktime: ', this.worktime);
					localFunc(this.datedata1, this.datedata2);
				}
			})
		
			// var from_picker = $('#startingDate').pickadate('picker')
			
			// var to_picker = $('#endingDate').pickadate('picker')

			var localFunc = (from, to)=>{
				// setTimeout(()=>{
					console.log("this.datedata1, this.datedata2",$('#startingDate').val(),$('#endingDate').val());
					if($('#startingDate').val() && $('#endingDate').val()){
						this.getAllDate($('#startingDate').val(),$('#endingDate').val());
					}
					// },3000);
				}
			$('.datepicker').pickadate({ 
			
			max : new Date(),
		})
		
			this.getAllDevelopers();

			
			}

			getAllDevelopers(){
				this._projectService.getAllDevelopers().subscribe(res=>{
					console.log("msg-------",res);
					// this.developers = res;
					this.developers = res;
					this.userid = [];
					_ .forEach(this.developers,(developer)=>{
						// console.log("userid=======",developer._id);
						this.userid.push(developer.name);

					})
					console.log("userid============",this.userid);

					this.developers.sort(function(a, b){
						if (a.name && b.name) {
							var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
							if (nameA < nameB) //sort string ascending
								return -1 
							if (nameA > nameB)
								return 1
							return 0 //default return value (no sorting)
						}
					})
					console.log("Developers",this.developers);
				},err=>{
					console.log("Couldn't get all developers ",err);
					this._alertService.error(err);
				})
				setTimeout(()=>{
					console.log("rotate js--------------------")
					$('a.rotate-btn').click(function () {
						$(this).parents(".card-rotating").toggleClass('flipped');
					});
				},2000);
			}



			dateSelected(event){
				var date = moment(event).format('YYYY-MM-DD');
				console.log("event  of date ===>" , date); 
				
					this._leaveService.empAttendence(date).subscribe((res:any)=>{
						console.log("res ==>" , res);

						if(res == null){
							console.log("either Holiday or No attendence");
							Swal.fire("You Are Absent On" + " " +date);
						}

						else{

							this.worktime = res;

							console.log("worktime============-------",this.worktime);

							this.gate = [];

							this.gate.push(this.worktime);

							this.workdifference = [];

							_ .forEach(this.gate,(gate)=>{

								if(gate.difference != null){

									gate.difference = gate.difference.split("T");
									gate.difference = gate.difference[1];
									gate.difference = gate.difference.split("Z");
									gate.difference = gate.difference[0];
								}
								this.workdifference.push(gate.difference);
							})
							console.log("workdifference===============",this.workdifference);

							var obj = {

								'difference':this.workdifference[0]

							}

							console.log("obj===========",obj.difference);

							this.diffff = obj.difference;
							console.log("difffffffffff==============",this.diffff);

							console.log("either==============-",this.worktime);


							this.logs = this.worktime.in_out;

							_.map(this.logs, function(log){

								if(log.checkOut!=null){
									var diff = Number(new Date(log.checkOut)) - Number(new Date(log.checkIn));
									var hours = Math.floor(diff / 1000 / 60 / 60);
									var min = Math.floor((diff/1000/60)%60);
									var sec = (Math.floor((diff/1000) % 60)>9)?Math.floor((diff/1000) % 60):'0'+Math.floor((diff/1000) % 60);
									log['diff'] = hours + ':' + min + ':' + sec;

									var time = moment().format('h:mm:ss');
									console.log("time=================",time);

									var out = log.diff;
									console.log("log============---------",out);
								}

							})

							this.attendenceByDate.push(res);
							console.log("logs{}{}{}==========-",this.logs);

							localStorage.setItem("attendenceByDateError",JSON.stringify(false));
							this.attedenceByDateError = false;
						}



					},err=>{
						localStorage.setItem("attedenceByDateError",JSON.stringify(true));
						this.attedenceByDateError = true;
						this.errMessage = "Either Absent Or Holiday"
						console.log("error",err);
					})
				

				this._leaveService.getUserById(date).subscribe((res:any)=>{

					console.log("response--------------===========-=",res);
					this.presentuser = res;

					this.alldiff = [];

					_ .forEach(this.presentuser,(pre)=>{

						if(pre.difference!= null){
							pre.difference = pre.difference.split("T");
							pre.difference = pre.difference[1];
							pre.difference = pre.difference.split("Z");
							pre.difference = pre.difference[0];
						}


						this.alldiff.push(pre.difference);


					})

					console.log("alldiff=============",this.alldiff);

					this.presentid = [];
					_ .forEach(this.presentuser,(present)=>{

						this.presentid.push(present.UserName);

					})
					console.log("present userid============",this.presentid);

					this.missing = this.userid.filter(item => this.presentid.indexOf(item) < 0);
					console.log("absent student========>>>>",this.missing);
				})
			

}



puser(log){

	console.log("log============",log);
	this.arry = log;
	$('#myModal').modal('show');


	_.map(this.arry, function(log){

		if(log.checkOut!=null){
			var diff = Number(new Date(log.checkOut)) - Number(new Date(log.checkIn));
			var hours = Math.floor(diff / 1000 / 60 / 60);
			var min = Math.floor((diff/1000/60)%60);
			var sec = (Math.floor((diff/1000) % 60)>9)?Math.floor((diff/1000) % 60):'0'+Math.floor((diff/1000) % 60);
			log['diff'] = hours + ':' + min + ':' + sec;

		}

	})
	console.log("arry--------=========",this.arry);

}

getAllDate(from,to){
	this.loader = true;
	setTimeout(()=>{
		console.log(' get all date func caled: ', from, to);
		this._leaveService.getUserByDate(from,to).subscribe((res:any)=>{
			console.log("userDate=======================",res);
			this.worktime = null;
			this.finalResultPresentUser = res;
			console.log("finalresult==============",this.finalResultPresentUser);
			this.alldifference = [];

			_ .forEach(this.finalResultPresentUser,(pre)=>{

				if(pre.difference!= null){
					pre.difference = pre.difference.split("T");
					pre.difference = pre.difference[1];
					pre.difference = pre.difference.split("Z");
					pre.difference = pre.difference[0];
				}
				this.alldifference.push(pre.difference);
			});
			console.log("allllllllllll============>",this.alldifference);
			this.change.detectChanges();
			this.loader=false;
		},err=>{
			console.log("userDate=======================",err);
		})
	},1000);
}

getByMailDetails(event){

	console.log("event==========",event);

	var date = moment(event).format('YYYY-MM-DD');
	console.log("event  of date ===>" , date);  

	this._leaveService.getDetails(date).subscribe((res:any)=>{
		console.log("userDate=======================",res);

	},err=>{
		console.log("userDate=======================",err);
	})
}


}