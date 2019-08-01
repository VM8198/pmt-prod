import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';
declare var $:any;

@Component({
	selector: 'app-forgotpwd',
	templateUrl: './forgotpwd.component.html',
	styleUrls: ['./forgotpwd.component.css']
})
export class ForgotpwdComponent implements OnInit {
	resetPasswordForm:FormGroup;
	token;
	show: boolean;
	pwd: boolean;
	pwd1: boolean;
	show1: boolean;
	match: boolean = false;
	submitted = false;
	isDisable:boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private _loginService: LoginService
		) {
		this.token = this.route.snapshot.params.token; 
	}

	ngOnInit() {
		this.resetPasswordForm = this.formBuilder.group({
			password: new FormControl( '', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
			confirmPassword: new FormControl( '', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
		});

		$(".toggle-password").click(function() {
			$(this).toggleClass("fa-eye fa-eye-slash");
		});
	}
	get f() { return this.resetPasswordForm.controls; }

	resetPassword(){
		this.submitted = true;
		if (this.resetPasswordForm.invalid) {
			return;
		}
		this.isDisable = true;
		if(this.resetPasswordForm.value.password == this.resetPasswordForm.value.confirmPassword){
			delete this.resetPasswordForm.value["confirmPassword"];
			var obj = {};
			obj = {
				"password": this.resetPasswordForm.value.password,
				"token": this.token
			};
			this._loginService.updatepwd(obj).subscribe(res=>{
				console.log("res-=-=",res);
				Swal.fire("","Password reset successfully","success");
				this.isDisable = false;
				this.router.navigate(["/login"]);
			},err=>{
				console.log("res-=-=",err);
				Swal.fire({
					type: 'error',
					title: 'Oops...',
					text: 'Link Expired!',
					footer: ''
				})
				this.isDisable = false;
			})
		}
		else if(this.resetPasswordForm.value.password != this.resetPasswordForm.value.confirmPassword){
			Swal.fire({
				type: 'error',
				title: 'Oops...',
				text: 'Please enter matching password!',
				footer: ''
			})
			this.isDisable = false;
		}
	}

	password() {
		this.show = !this.show;
		this.pwd = !this.pwd;
	}
	confirmPassword() {
		this.show1 = !this.show1;
		this.pwd1 = !this.pwd1;
	}
	comparePassword(form){
		console.log(form.value.password == form.value.confirmPassword, this.match);
		if(form.value.password === form.value.confirmPassword){
			console.log("In true condition");
			this.match = true;
		}else{
			this.match = false;
		} 

	}

}
