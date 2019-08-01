import { Component, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { config } from '../config';
declare var $:any;
import * as _ from 'lodash';
import Swal from 'sweetalert2';


@Component({
	selector: 'app-add-notice',
	templateUrl: './add-notice.component.html',
	styleUrls: ['./add-notice.component.css']
})
export class AddNoticeComponent implements OnInit {
	// files:FileList;
	files: Array<File> = [];
	addForm:FormGroup;
	path = config.baseMediaUrl;
	submitted = false;
	isDisable:boolean= false;
	constructor(public router:Router, public _projectservice:ProjectService) { 

		this.addForm = new FormGroup({
			title: new FormControl('', [Validators.required,  Validators.maxLength(50)]),
			desc: new FormControl('', [Validators.required,  Validators.maxLength(300)]),
			images: new FormControl(''),
			published:new FormControl(''),
			expireon:new FormControl('')
		});
	}
	
	ngOnInit() {
		this.getAllNotice();
		$('.datepicker').pickadate({ min: new Date(),
		})
	}
	get f() { return this.addForm.controls; }
	addNotice(addForm){
		this.submitted = true;
		if (this.addForm.invalid) {
			return;
		}
		this.isDisable= true;
		addForm.expireon = $('#expireon').val();
		console.log(addForm);
		var data = new FormData();
		_.forOwn(addForm, function(value, key) {
			data.append(key, value)
		});
		console.log(addForm, this.files);
		if(this.files && this.files.length>0){
			for(var i=0;i<this.files.length;i++){
				data.append('uploadfile', this.files[i]);
			}
		}
		data.append('createdby', JSON.parse(localStorage.getItem('currentUser'))._id);
		this._projectservice.addNotice(data).subscribe((res:any)=>{
			Swal.fire({type: 'success',title: 'Notice Added Successfully',showConfirmButton:false,timer: 2000})
			this.router.navigate(['./noticeboard']);
			console.log(res);
			this.isDisable= false;
		},err=>{
			console.log(err);   
			Swal.fire('Oops...', 'Something went wrong!', 'error')
			this.isDisable= false;
		}) 
	}

	getAllNotice(){

		this._projectservice.getNotice().subscribe((res:any)=>{
			console.log(res);
		},err=>{
			console.log(err);    
		})
	}

	changeFile(event){
		console.log(event);
		this.files = event;
	}

}
