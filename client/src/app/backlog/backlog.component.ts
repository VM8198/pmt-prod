import { Component, OnInit, HostListener,EventEmitter} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import {SearchTaskPipe} from '../search-task.pipe';
import { ChildComponent } from '../child/child.component';
import { config } from '../config'
declare var $ : any;
import * as _ from 'lodash';
import { Chart } from 'chart.js';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'app-backlog',
	templateUrl: './backlog.component.html',
	styleUrls: ['./backlog.component.css']
})
export class BacklogComponent implements OnInit {
	projectOne;
	sprintTrack;
	project;
	sprints:any;
	projectId;
	addForm:FormGroup;
	editSprintForm:FormGroup;
	singlesprint:any;
	startsprintId;
	sprintData = {
		startDate : "",
		endDate: ""
	}
	Active;
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	tracks;
	allSprints = [];
	totalSDuration:number = 0;
	pdealine;
	prdead;
	pstart;
	pduration:number = 0;
	remainingLimit:number = 0;
	pDuration;
	currentdate = moment().format('YYYY-MM-DD'); 
	activeSprint;
	projectDealine;
	submitted:boolean = false;
	newsprint;
	addSprintres;
	isDisable:boolean = false;
	constructor(public _projectService: ProjectService, private route: ActivatedRoute,private change: ChangeDetectorRef) { 
		this.route.params.subscribe(param=>{
			this.projectId = param.id;
		});
		this.addForm = new FormGroup({
			title: new FormControl('', Validators.required),
			goal: new FormControl('',Validators.required),
			startDate: new FormControl('',Validators.required),
			endDate:new FormControl('',Validators.required)
		});
		
		this.getProject(this.projectId);			
		this.createEditSprintForm();
		this.getTaskbyProject(this.projectId);
		
	}


	ngOnInit() {
		this.getSprint(this.projectId);
		this.projectDealine = JSON.parse(localStorage.getItem('projectdeadline'));
		console.log("project dealine in ng on init",this.projectDealine);
		this.change.detectChanges();
		
		

		var from_input = $('#addStartDate').pickadate({
			min:new Date(),
		}),
		from_picker = from_input.pickadate('picker')

		var to_input = $('#addEndDate').pickadate({
			min:new Date()
		}),
		to_picker = to_input.pickadate('picker')


		// var from_input_edit = $('#editstartDate').pickadate(),
		// from_picker = from_input_edit.pickadate('picker')

		// var to_input_edit = $('#editendDate').pickadate(),
		// to_picker = to_input_edit.pickadate('picker')


		if ( from_picker.get('value') ) {
			console.log(from_picker.get('select'));
			to_picker.set('min', from_picker.get('select'))

		}
		if ( to_picker.get('value') ) {
			from_picker.set('max', to_picker.get('select'))
		}
		from_picker.on('set', function(event) {
			if ( event.select ) {
				console.log(from_picker.get('select'));
				local();
				// setStart;
				to_picker.set('min', from_picker.get('select'))
			}
			else if ( 'clear' in event ) {
				to_picker.set('min', false)
			}
		})
		to_picker.on('set', function(event) {
			if ( event.select ) {
				from_picker.set('max', to_picker.get('select'))+1
				local();
			}
			else if ( 'clear' in event ) {
				from_picker.set('max', false)
			}
		})
		var local = ()=>{
			this.setStartFunc();
		}
		// Date Picker Valadation End Here
	}
	setStartFunc(){
		console.log(this.addForm);
		if($('#addStartDate').val())
			this.addForm.controls.startDate.setValue($('#addStartDate').val());
		if($('#addEndDate').val())
			this.addForm.controls.endDate.setValue($('#addEndDate').val());
	}
	refresh(): void {
		window.location.reload();
	}

	getEmptyTracks(){
		console.log("user=====================>",this.currentUser.userRole);
		if(this.currentUser.userRole == "projectManager" || this.currentUser.userRole == "admin"){

			this.tracks = [
			{
				"title": "Todo",
				"id": "to do",
				"class":"primary",
				"tasks": [

				]
			},
			{
				"title": "In Progress",
				"id": "in progress",
				"class":"info",
				"tasks": [

				]
			},
			{
				"title": "Testing",
				"id": "testing",
				"class":"warning",
				"tasks": [

				]
			},
			{
				"title": "Done",
				"id": "complete",
				"class":"success",
				"tasks": [

				]
			}
			];
			console.log("tracks====-=-_+_++",this.tracks);
		}
		else{
			this.tracks = [
			{
				"title": "Todo",
				"id": "to do",
				"class":"primary",
				"tasks": [

				]
			},
			{
				"title": "In Progress",
				"id": "in progress",
				"class":"info",
				"tasks": [

				]
			},
			{
				"title": "Testing",
				"id": "testing",
				"class":"warning",
				"tasks": [

				]
			}
			];
			console.log("tracks====-=-_+_++",this.tracks);

		}
	}

	getProject(id){
		this._projectService.getProjectById(id).subscribe((res:any)=>{
			console.log(res);
			this.projectOne = res;
			var pdealine = moment(this.projectOne.deadline);
			var pstart = moment(this.projectOne.createdAt);
			this.prdead = moment(this.projectOne.deadline).format("YYYY,M,DD");
			console.log("prdead ===+++>" , this.prdead);
			this.pduration = pdealine.diff(pstart,'days');
			console.log("Project Duration=====>>>",this.pduration);
			localStorage.setItem('projectduration' , JSON.stringify(this.pduration));
			localStorage.setItem('projectdeadline' , JSON.stringify(this.prdead));
			var startpicker = $('#addStartDate').pickadate('picker');
			startpicker.set('max', new Date(this.prdead));
			var endpicker = $('#addEndDate').pickadate('picker');
			endpicker.set('max', new Date(this.prdead));

			endpicker.set('min',new Date(startpicker))
		},(err:any)=>{
			console.log("err of team============>"  ,err);
		});
	}
	get f() { return this.addForm.controls; }

	addSprint(addForm){
		this.submitted = true;
		if (this.addForm.invalid) {
			return;
		}
		this.isDisable = true;
		console.log('addForm===============>',addForm);
		addForm.startDate = $('#addStartDate').val();
		// addForm.startDate = $('#startDate').val();
		console.log('addForm.startDate================>',addForm.startDate);
		addForm.endDate = $('#addEndDate').val();
		// addForm.duration = this.durationOfDate(addForm.startDate,addForm.endDate);
		addForm.projectId = this.projectId;
		console.log("form value==>>",addForm);

		this._projectService.addSprint(addForm).subscribe((res:any)=>{
			console.log("addfoormmmmmmmmmmm=====",res);
			$("#addStartDate,#addEndDate").val('');
			// this.addForm.reset();
			this.addSprintres = res;
			$('#addsprint').modal('hide');
			Swal.fire({type: 'success',title: 'Sprint Created Successfully',showConfirmButton:false,timer: 2000})			
			this.addForm.reset();
			this.getSprint(this.projectId);
			this.isDisable = false;
		},(err:any)=>{
			console.log(err);
			Swal.fire('Oops...','Something went wrong!', 'error')
			this.isDisable = false;
		});
	}

	getSprint(projectId){
		console.log("project id of current project",this.projectId);
		this._projectService.getSprint(this.projectId).subscribe((res:any)=>{
			console.log("All sprint response--------->>>>>>>",res);
			console.log("status=====>",res[0].status);
			this.sprints = res;
			_.forEach(this.sprints , (sprint)=>{
				console.log("single sptint", sprint);
				console.log('sprint durration==>',sprint.duration);
				console.log('total-sprint=======',this.totalSDuration);
				this.totalSDuration = this.totalSDuration + sprint.duration; 
				console.log('this.totalSDuration=====>',this.totalSDuration);
				if(sprint.status == 'Active'){
					this.Active = true;
					this.activeSprint = sprint;
					var activeSprintEnd = moment(this.activeSprint.endDate).format("YYYY,M,DD");
					console.log('activeSprintEnd================>',activeSprintEnd);
					var startpicker = $('#addStartDate').pickadate('picker');
					console.log('startpicker=======>',startpicker);
					startpicker.set('min', new Date(activeSprintEnd));
					
				}
			})
			console.log("Active Sprint------->>>>>>",this.activeSprint);
			this.pDuration = JSON.parse(localStorage.getItem('projectduration'));
			console.log("is Active available sprint",this.Active);
			console.log("total sprint Duration Yash ",this.totalSDuration);
			console.log("total project Duration",this.pDuration);
			this.remainingLimit = this.pDuration - this.totalSDuration;
			console.log("this.remainingLimit",this.remainingLimit);
		},(err:any)=>{
			console.log(err);
		});
	}

	createEditSprintForm(){
		this.editSprintForm = new FormGroup({
			title: new FormControl('', Validators.required),
			goal: new FormControl('',Validators.required),
			startDate: new FormControl('',Validators.required),
			endDate:new FormControl('',Validators.required)
		})
	}

	updateSprint(sprint){
		this.isDisable = true;
		console.log("update Notice =====>",sprint);
		sprint.startDate = moment(sprint.startDate).format('YYYY-MM-DD'); 
		console.log("start sprint =====>",sprint.startDate);
		console.log("system date",this.currentdate);
		sprint.duration = this.durationOfDate(sprint.startDate,sprint.endDate);
		console.log("sprint ID=========>>>>",sprint);
		console.log('this.remainingLimit==========>',this.remainingLimit);
		
		if(sprint.duration > this.remainingLimit){
			Swal.fire('Oops...', 'Sprint Duration Over ProjectDueDate!', 'error')
			this.isDisable = false;
		}
		else{
			this._projectService.updateSprint(sprint).subscribe((res:any)=>{
				$('#editmodel').modal('hide');
				Swal.fire({type: 'success',title: 'Sprint Updated Successfully',showConfirmButton:false,timer: 2000})
				$('#editmodel').modal('hide');
				this.getSprint(this.projectId);
				this.isDisable = false;
				// this.editSprintForm.reset();
			},err=>{
				console.log(err);
				Swal.fire('Oops...', 'Something went wrong!', 'error')
				this.isDisable = false;
			})
		}
	}


	deleteSprint(sprintid){
		console.log("deleted id",sprintid);

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {

			if (result.value) {

				this._projectService.deleteSprint(sprintid).subscribe((res:any)=>{
					Swal.fire(
						'Deleted!',
						'Your Sprint has been deleted.',
						'success'
						)
					this.getSprint(this.projectId);
				},err=>{
					console.log(err);
					Swal.fire('Oops...', 'Something went wrong!', 'error')
				})

			}
		})
	}

	sprintById(sprintid){
		this._projectService.sprintById(sprintid).subscribe((res:any)=>{
			console.log("response====>>>",res);
			this.singlesprint=res[0];
			console.log("all sprint===>>>", this.singlesprint);
		},err=>{
			console.log(err);    
		})
	}

	startSprint(sprint){
		this.isDisable = true;
		console.log($('#startDate').val(), $('#endDate').val());
		sprint.startDate = moment($('#startDate').val()).format('YYYY-MM-DD');
		sprint.endDate = moment ($('#endDate').val()).format('YYYY-MM-DD'); 
		console.log("start sprint =====>",sprint.startDate);
		sprint.endDate = moment($('#endDate').val()).format('YYYY-MM-DD');
		console.log("system date",this.currentdate);
		sprint.duration = this.durationOfDate(sprint.startDate,sprint.endDate);
		console.log("sprint ID=========>>>>",sprint);
		console.log("date of sprint============",sprint.startDate , this.currentdate, sprint.startDate == this.currentdate);
		if(sprint.startDate == this.currentdate){
			console.log("sprint.duration" , sprint.duration);
			console.log("this.remainingLimit" , this.pDuration);
			if(sprint.duration > this.pDuration){
				console.log("duration of sprint===========>",sprint.duration);
				console.log("total sprint Duration",this.totalSDuration);
				console.log("total project Duration",this.pDuration);
				this.remainingLimit = this.pDuration-this.totalSDuration;
				console.log("remaininglimit of sprint===========>",this.remainingLimit);
				Swal.fire('Oops...', 'Sprint Duration Over ProjectDueDate!', 'error')
				this.isDisable = false;
			}
			else{
				Swal.fire({
					title: 'Are you sure?',
					text: "You won't be able to revert this!",
					type: 'warning',
					showCancelButton: false,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes,Start it!'
				}).then((result) => {
					console.log("result of sprint",result);
					setTimeout(()=>{
						if (result.value) {
							this._projectService.startSprint(sprint).subscribe((res:any)=>{
								Swal.fire(
									'Started!',
									'Your Sprint has been Started.',
									'success'
									)
								$('#startmodel').modal('hide');
								this.addForm.reset();
								this.getSprint(this.projectId);
								// window.location.reload();
								this.isDisable = false;
							},err=>{
								console.log(err);
								Swal.fire('Oops...', 'Something went wrong!', 'error')
								this.isDisable = false;
							})

						}
					},1000)
					
				})
			}
		}
		else{
			Swal.fire('Oops...', 'Start Date Must be CurrentDate!', 'error')
		}
	}

	getTaskbyProject(projectId){
		this._projectService.getTaskById(projectId).subscribe((res:any)=>{
			console.log("all response ======>" , res);
			this.getEmptyTracks();
			this.project = res;
			console.log("PROJECT=================>", this.project);
		},err=>{
			console.log(err);
		})	

	}

	getTaskCount(sprintId, status){
		return _.filter(this.project, function(o) {  
			if(o.sprint._id == sprintId && o.status == status){
				return o;
			}
		}).length;
	}

	durationOfDate(startDate,endDate){
		var startLimit = moment(startDate); 
		var endLimit = moment(endDate); 
		var duration;
		return duration = endLimit.diff(startLimit,'days')
	}

	completeSprint(sprintId){
		console.log("Sprint ID=====>>>",sprintId);
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes,complete it!'
		}).then((result) => {
			setTimeout (()=>{
				if (result.value) {

					this._projectService.completeSprint(sprintId).subscribe((res:any)=>{
						Swal.fire(
							'Complete!',
							'Your Sprint has been Completed.',
							'success'
							)
						console.log("res=======",res);
						this.Active = false;
						// window.location.reload();
						this.getSprint(this.projectId);
					},err=>{
						console.log(err);
						Swal.fire('Oops...', 'Something went wrong!', 'error')
					})

				}
			},1000)
		})

	}

	editSprintData(data){	
		console.log('data====================>',data);
		this.newsprint = data;
		console.log('this.newsprint=================>',this.newsprint);
		setTimeout(()=>{
			$('#startDate, #editstartDate').pickadate({ 
				min: new Date(),
				max: new Date(this.prdead),
				format: ' mm/dd/yyyy',
				formatSubmit: 'mm/dd/yyyy',
				onSet: function(date){
					var date1=new Date(date.select).toISOString();
					console.log('date================>',date1);
					updateDates('startDate', date1);
				}
			})	
			$('#endDate, #editendDate').pickadate({ 
				min: new Date(),
				max: new Date(this.prdead),
				format: ' mm/dd/yyyy',
				formatSubmit: 'mm/dd/yyyy',
				onSet: function(date){
					var date1=new Date(date.select).toISOString();
					console.log('date================>',date1);
					updateDates('endDate', date1);

				}
			})	
		},500)

		let updateDates = (key, val)=>{
			console.log(key,val);
			this.newsprint[key] = val;
			// this.sprintData={
				// 	key: val
				// }
				console.log(this.newsprint);
			}

		}
	}	
