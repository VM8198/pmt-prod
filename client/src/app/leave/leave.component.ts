import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import {Router} from '@angular/router';
import { NgModule } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import{LeaveService} from '../services/leave.service';
// import { ImageViewerModule } from 'ng2-image-viewer';
import Swal from 'sweetalert2';
declare var $ : any;




@Component({
	selector: 'app-leave',
	templateUrl: './leave.component.html',
	styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
	addForm:FormGroup;
	files: Array<File> = [];
	showOneDays;
	showMoreDayss;
	leaveDuration;
	startDate;
	commentUrl= [];
	url = [];
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	submitted = false;
	isDisable:boolean = false;

	constructor(public router:Router, public _leaveService:LeaveService) {
		this.addForm = new FormGroup({
			leaveDuration : new FormControl (''),
			typeOfLeave : new FormControl ('',Validators.required),
			reasonForLeave : new FormControl (''),
			startingDate: new FormControl (''),
			noOfDays: new FormControl(''),
			endingDate: new FormControl (''),
			singleDate: new FormControl(''),
			attechment: new FormControl('')
		})
	}

	
	ngOnInit() {

		
		$('.datepicker').pickadate({ 
			min: new Date(),
			
		})
		var from_input = $('#startDate').pickadate(),
		from_picker = from_input.pickadate('picker')

		var to_input = $('#endDate').pickadate(),
		to_picker = to_input.pickadate('picker')



		if ( from_picker.get('value') ) {
			console.log(from_picker.get('select'));
			to_picker.set('min', from_picker.get('select'))
		}
		if ( to_picker.get('value') ) {
			from_picker.set('max', to_picker.get('select'))
		}

		from_picker.on('set', function(event) {
			if ( event.select ) {
				to_picker.set('min', from_picker.get('select'))
				console.log(from_picker.get('select'));
			}
			else if ( 'clear' in event ) {
				to_picker.set('min', false)
			}
		})

		to_picker.on('set', function(event) {
			if ( event.select ) {
				from_picker.set('max', to_picker.get('select'))+1
				console.log(to_picker.get('select'));
			}
			else if ( 'clear' in event ) {
				from_picker.set('max', false)
			}
		})
		this.showMoreDayss = false;
		localStorage.setItem("showMoreDayss" , JSON.stringify(false));

		this.showOneDays = false;
		localStorage.setItem("showOneDays" , JSON.stringify(false));

	}
	
	changeFile(event){
		this.files = event;
		console.log(this.files);
		console.log("filesssssssss",this.files);
	}
	get f() { return this.addForm.controls; }
	
	addLeave(form){
		console.log("form data============>",form);

		this.submitted = true;
		if (this.addForm.invalid) {
			return false;
		}
		this.isDisable = true;
		form.startingDate = $('#startDate').val();
		form.singleDate = $('#startDateFor1').val();
		form.endingDate = $('#endDate').val();

		form['id'] = this.currentUser._id;
		form['name'] = this.currentUser.name;
		form['email'] = this.currentUser.email;

		console.log("valueeeeeeeeeeee",form, this.currentUser);
		if(form.singleDate){
			form.noOfDays = "1-day";
			console.log("single date======>",form.singleDate);
		}
		console.log("form data========>",form);
		if(form.noOfDays == "1-day"){
			form['endingDate'] = form['singleDate'];
			form['startingDate'] = form['singleDate'];
			console.log("datesssssssssssss",form);
		}else{
			form.noOfDays == "more-day"
			var date2 = new Date(form.startingDate);
			var date1 = new Date(form.endingDate);
			// console.log("staring date ===" , date2);
			console.log("ending date ===" , date1);
			form['endingDate'] = $('#endDate').val();
			form['startingDate'] = $('#startDate').val();
			// console.log("staring date ...... ===" , date2);
			// console.log("ending date .........===" , date1);
			var timeDuration = Math.abs(date1.getTime()- date2.getTime());
			var daysDuration = Math.ceil(timeDuration/(1000 * 3600 * 24));
			console.log("daysDuration =======+>" , daysDuration);
			form['leaveDuration'] = daysDuration;
			console.log("form data======>",form);
		}

		this._leaveService.addLeave(this.addForm.value, this.files).subscribe((res:any)=>{
			Swal.fire({type: 'success',title: 'Leave Apply Successfully',showConfirmButton:false,timer: 2000})
			this.addForm.reset();
			this.isDisable = false;
			this.router.navigate(['./myleave']);
			console.log("ressssssssssssss",res);


		},err=>{
			console.log(err);
			Swal.fire('Oops...', 'Something went wrong!', 'error')
			this.isDisable = false;
		})
	}
	showOneDay(){
		console.log("show one day ==>" , this.showOneDays);
		this.showMoreDayss = false;
		localStorage.setItem("showMoreDayss" , JSON.stringify(false));
		if(this.showOneDays == false){
			this.showOneDays = true;
			localStorage.setItem("showOneDays" , JSON.stringify(true));
			console.log("show one day ==>" , this.showOneDays);
		}
		else{
			this.showOneDays = false;
			localStorage.setItem("showOneDays" , JSON.stringify(false));
		}
	}
	showMoreDays(){
		$('.datepicker').pickadate();
		localStorage.setItem("showOneDays" , JSON.stringify(false));
		this.showOneDays = false;
		if(this.showMoreDayss == false){
			this.showMoreDayss = true;
			localStorage.setItem("showMoreDayss" , JSON.stringify(true));
		}
		else{
			this.showMoreDayss = false;
			localStorage.setItem("showMoreDayss" , JSON.stringify(false));
		}
	}

}
