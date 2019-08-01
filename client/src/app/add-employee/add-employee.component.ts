import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import {ProjectService} from '../services/project.service';
import {LoginService} from '../services/login.service';
declare var $ : any;
import * as _ from 'lodash';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-add-employee',
	templateUrl: './add-employee.component.html',
	styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {

	addEmployeeForm: FormGroup;
	
	files: Array<File> = [];
	materialSelect;
	submitted = false;
	isDisable:boolean= false;
	show: boolean;
	pwd: boolean;
	phone;

	constructor( public router:Router, public route: ActivatedRoute,private formBuilder: FormBuilder, public _projectservice:ProjectService,public _loginservice:LoginService) {
		this.addEmployeeForm = this.formBuilder.group({
			name:new FormControl( '', [Validators.required, Validators.minLength(2),  Validators.maxLength(20)]),
			password:new FormControl( '', [Validators.required, Validators.minLength(6),Validators.maxLength(20)]),
			isDelete: new FormControl('false', [Validators.required]),
			email: new FormControl('', [Validators.required, Validators.email]),
			date:new FormControl('',[Validators.required]),
			phone:new FormControl( '', [Validators.minLength(10), Validators.maxLength(10)]),
			userRole:new FormControl('',[Validators.required]),
			experience:new FormControl(''),	
			profile:new FormControl(''),
			cv:new FormControl('')
		}); 
	}
	ngOnInit() {
		$('.datepicker').pickadate({
			// min: new Date(),
			onSet: function(context) {
				change();
			}
		});
		var change:any = ()=>{
			this.addEmployeeForm.controls.date.setValue($('.datepicker').val());
		}
		$(".toggle-password").click(function() {
			$(this).toggleClass("fa-eye fa-eye-slash");
		});

	}

	// myFunction() {
		// 	var x = document.getElementById("message");
		// 	x.value = "";
		// }

		password() {
			this.show = !this.show;
			this.pwd = !this.pwd;
		}

		get f() { return this.addEmployeeForm.controls; }

		addEmployee(addEmployeeForm){
			this.submitted = true;
			if (this.addEmployeeForm.invalid) {
				return;
			}
			this.isDisable= true;
			this.addEmployeeForm.value['userId'] = JSON.parse(localStorage.getItem('currentUser'))._id;
			this.addEmployeeForm.value.date = $('.datepicker').val();
			console.log("form value=====>>>",addEmployeeForm.value);
			this._loginservice.addUser_with_file(addEmployeeForm.value,this.files).subscribe((res:any)=>{
				Swal.fire({type: 'success',title: 'Employee Added Successfully',showConfirmButton:false,timer: 2000})
				this.router.navigate(['./all-employee']);
				console.log("res=-=-=()()",res);
				this.isDisable= false;
			},err=>{
				Swal.fire('Oops...', 'Something went wrong!', 'error')
				console.log("error",err);  
				this.isDisable= false;  
			})
		}

		addFile(event){
			_.forEach(event.target.files, (file:any)=>{
				if(file.type == "application/pdf" || file.type == "image/*"){
					this.files.push(file);
				}else {
					Swal.fire({
						title: 'Error',
						text: "You can upload pdf file only",
						type: 'warning',
					})
				}
			})
		}

		validatePhone(form)
		{
			console.log(form);
			var phoneno = /[0-9]/ ;
			var message = document.getElementById('message');
			if(!form.phone.match(phoneno)){
				console.log("message==========",message)
				message.innerHTML = "Please enter only numbers"
			}else{
				message.innerHTML = "";
			}
		}

		validateName(form)
		{
			console.log(form);
			var nameInput = /[a-zA-Z ]/ ;
			var message1 = document.getElementById('message1');
			if(!form.name.match(nameInput)){
				console.log("message==========",message1)
				message1.innerHTML = "Name can not start with digit"
			}else{
				message1.innerHTML = "";
			}
		}

		// validateEmail(form){
		// 	console.log(form);
		// 	let email = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		// 	var message2 = document.getElementById('message2');
		// 	if (!form.email.match(email)){
		// 		message2.innerHTML = "Enter valid email address"
		// 	} else{
		// 		message2.innerHTML = "";
		// 	}
		// }
	}

	

