import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';
import { LoginService } from '../services/login.service';

@Component({
	selector: 'app-update-user',
	templateUrl: './update-user.component.html',
	styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {

	editUserForm: FormGroup;
	loading = false;
	submitted = false;
	userId;
	user;
	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private _loginService: LoginService,
		private _alertService: AlertService
		) { 
		this.route.params.subscribe(param=>{
			this.userId = param.id;
			this.getUserById(this.userId);
		});
	}

	ngOnInit() {
		this.editUserForm = this.formBuilder.group({
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			username: ['', Validators.required],
		});
	}

	getUserById(id){
		this._loginService.getUserById(id).subscribe((res:any)=>{
			this.user = res;
			console.log(this.user);
		},err=>{
			console.error(err);
		})
	}

	getUserFname(name){
		return name.split(" ")[0];
	}
	getUserLname(name){
		return name.split(" ")[1];
	}

	// convenience getter for easy access to form fields
	get f() { return this.editUserForm.controls; }

	onSubmit() {
		console.log(this.editUserForm);
	}

}
