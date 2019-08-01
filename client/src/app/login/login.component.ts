import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';
import { LoginService } from '../services/login.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
declare var $:any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  forgotPasswordForm: FormGroup;
  loader = false;
  show: boolean;
  pwd: boolean;
  err: any;
  error1Msg;
  errorMsg;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  name;
  isDisable = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _loginService: LoginService,
    private _alertService: AlertService,
    private toaster: ToastrService
    ) {
    // redirect to home if already logged in
    if (this._loginService.currentUserValue) { 
      this.router.navigate(['/']);
      this.show = false;
      this.pwd = false;
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.forgotPasswordForm = this.formBuilder.group({
      email: ['']
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    $(".toggle-password").click(function() {
      $(this).toggleClass("fa-eye fa-eye-slash");
    });

    $('#modalForgotPasswordForm').click(function(){
      $('.reset_form')[0].reset();
    });
    $('.modal-content').click(function(event){
      event.stopPropagation();
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.  submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.isDisable = true;
    this.loading = true;
    this._loginService.login(this.loginForm.value)
    .pipe(first())
    .subscribe(
      data => {  
        console.log("datysdsatyds",data);
        // Swal.fire({type: 'success',title: 'Login Successfully', showConfirmButton:false, timer:2000});
        // let name = data.data.name;

        // var myDate = new Date();
        // console.log("date mde che ke nai",myDate);
        // var hrs = myDate.getHours();
        // console.log("time mde che ke nai",hrs);
        // var greet ;
        // if(hrs<12)
        //   greet= 'Good Morning';
        // else if (hrs>=12 && hrs<=17)
        //   greet = 'Good Afternoon';
        // else if (hrs>=17 && hrs<=24)
        //   greet = 'Good Evening';

        // console.log("sanj no time print thavo joye",greet);
        // console.log("current user name>>>>>>><<<<<<<",name);
        // this.toaster.success(" "," " + greet + " " + name + ' Have a nice day', {
        //   timeOut: 2000,
        //   positionClass: 'toast-top-center',
        //   toastClass: 'custom',
        //   // messageClass:'name',
        // })
         this.isDisable = false;

        this.router.navigate([this.returnUrl]);
      },
      error => {
        this._alertService.error(error);
        if (error.status == 412) {

          this.err = error;
          console.log("error is===>",this.err.error.errMsg);
          this.errorMsg = this.err.error.errMsg;
           this.isDisable = false;
        }

        else if (error.status == 404) {
          this.err = error;
          console.log("error is===>",this.err.error.errMsg);
          this.errorMsg = this.err.error.errMsg;
           this.isDisable = false;
        }
        this.loading = false;
      });
  }


  showPassword(){
    // var pass = document.getElementById("FORMPASSWORD").setAttribute("type" , "text");
    var pass = document.getElementById("FORMPASSWORD").getAttribute("type");
    if(pass == "password"){
      document.getElementById("FORMPASSWORD").setAttribute("type" , "text");
    }
    else{
      document.getElementById("FORMPASSWORD").setAttribute("type" , "password");
    }
    // console.log("pass ==>" , pass);
  }
  updatePassword(){
    // this.submitted = true;
    // console.log(this.forgotPasswordForm.value);
    this.loader = true;
    this.isDisable = true;
    this._loginService.resetPwd(this.forgotPasswordForm.value).subscribe(res=>{
      console.log("res-=-=",res);
      this.loader = false;
      // alert("Reset password link sent on your email");
      Swal.fire("","Reset password link sent on your email","success");
      $('#modalForgotPasswordForm').modal('hide');
       this.isDisable = false;
    },error=>{
      this._alertService.error(error);
      if (error.status == 404) {
        this.err = error;
        console.log("error is ===>",this.err.error.errMsg);
        this.error1Msg = this.err.error.errMsg;
         this.isDisable = false;
      }
      this.loader = false;
      // alert("email not found");
    })    
  }
  
  password() {
    this.show = !this.show;
    this.pwd = !this.pwd;
  }
}