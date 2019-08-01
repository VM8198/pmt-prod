import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { config } from '../config';
declare var $ : any;
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import * as moment from 'moment';



@Component({
  selector: 'app-noticeboard',
  templateUrl: './noticeboard.component.html',
  styleUrls: ['./noticeboard.component.css']
})
export class NoticeboardComponent implements OnInit {

  constructor(public router:Router, public _projectservice:ProjectService) { }
  allNotice:any;
  singlenotice:any;
  noticeImg:any;
  editNoticeForm;
  swal:any;
  expireon;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  // files: any;
  url = [];
  commentUrl = [];
  path = config.baseMediaUrl;
  noticeid;
  files:Array<File> = [];
  i = 0;
  newNotice = { title:'', desc:'', published: '', expireon: '', images: [] };
  submitted =false;
  isDisable:boolean= false;

  @Output() noticeUpdate = new EventEmitter();


  ngOnInit() {
    this.getAllNotice();
    // this.getDetails(this.noticeid);
    this.createEditNoticeForm();
    $(document).ready(function(){
      setTimeout(function () {
        $('.grid').masonry({
          itemSelector: '.grid-item'
        });
      }, 2000);
    });
  }

  getAllNotice(){

    this._projectservice.getNotice().subscribe((res:any)=>{
      console.log("response====>>>",res);
      this.allNotice=res;
      console.log("all notice===>>>",this.allNotice);
      this.path = config.baseMediaUrl;
      console.log("base",this.path); 
    },err=>{
      console.log(err);    
    })
  }

  deleteNotice(id){
    console.log("deleted id",id);

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

        this._projectservice.deleteNotice(id).subscribe((res:any)=>{
          Swal.fire(
            'Deleted!',
            'Notice has been deleted.',
            'success'
            )
          this.getAllNotice();
        },err=>{
          console.log(err);
          Swal.fire('Oops...', 'Something went wrong!', 'error')
        })

      }
    })
  }
  
  createEditNoticeForm(){
    this.editNoticeForm = new FormGroup({
      title :new FormControl('', [Validators.required,  Validators.maxLength(50)]),
      desc : new FormControl('', [Validators.required,  Validators.maxLength(300)]),
      published : new FormControl(''),
      expireon :new FormControl('', [Validators.required]),
      images : new FormControl(''),
    })
  }
  get f() { return this.editNoticeForm.controls; }

  updateNotice(editNoticeForm, noticeId){
    this.submitted = true;
    if (this.editNoticeForm.invalid) {
      return;
    }
    this.isDisable= true;
    console.log("noticeId", noticeId);
    console.log("file is==",this.files);
    console.log("update Notice =====>",editNoticeForm);
    console.log("update Notice image =====>",editNoticeForm.images);
    let data = new FormData();
    data.append('title', editNoticeForm.title);
    data.append('desc', editNoticeForm.desc);
    data.append('expireon', editNoticeForm.expireon);
    data.append('published', editNoticeForm.published);
    data.append('images',editNoticeForm.images);
    if(this.files && this.files.length>0){
      for(var i=0;i<this.files.length;i++){
        data.append('images', this.files[i]);
      }
    }
    console.log("data Updated ==========================>" , data);
    this._projectservice.updateNoticeWithFile(data, noticeId).subscribe((res:any)=>{
      $('#editmodel').modal('hide');
      this.noticeUpdate.emit('noticeUpdate');
      this.getAllNotice();
      Swal.fire({type: 'success',title: 'Notice Updated Successfully',showConfirmButton:false,timer: 2000});
      this.files = [];
      this.url = [];
      console.log("files: ",this.files);
      this.isDisable= false;
    },err=>{
      console.log(err);
      Swal.fire('Oops...', 'Something went wrong!', 'error');
        this.isDisable= false;
    })
  }

  uploadFile(e,noticeid){
    _.forEach(e.target.files, (file:any)=>{
      // console.log(file.type);
      if(file.type == "image/png" || file.type == "image/jpeg" || file.type == "image/jpg"){
        this.files.push(file);
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e:any) => {
          this.url.push(e.target.result);
        }
        this._projectservice.changeNoticePicture(this.files,noticeid).subscribe((res:any)=>{
          console.log("resss=======>",res);
          Swal.fire({type: 'success',title: 'Notice Updated Successfully',showConfirmButton:false,timer: 2000})
          this.getAllNotice();
        },error=>{
          console.log("errrorrrrrr====>",error);
          Swal.fire('Oops...', 'Something went wrong!', 'error')
        });
      }else {
        Swal.fire({
          title: 'Error',
          text: "You can upload images only",
          type: 'warning',
        })
      }
    }) 
  }

  noticeById(noticeid){

    this._projectservice.getNoticeById(noticeid).subscribe((res:any)=>{
      console.log("response====>>>",res);
      this.singlenotice=res;
      console.log("all notice===>>>", this.singlenotice);
      console.log("all notice===>>>", this.singlenotice.images);
      this.noticeImg = this.singlenotice.images
      console.log("notice img===>",this.noticeImg);
      this.path = config.baseMediaUrl;
      console.log("base",this.path); 
    },err=>{
      console.log(err);    
    })
  }

  changeFile(event){
    console.log(event);
    this.files = event;
  }

  deleteNoticeImage(index){
    this.newNotice.images.splice(index,1);
  }

}

