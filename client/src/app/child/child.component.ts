import { Component, OnInit, Output, Input, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { CommentService } from '../services/comment.service';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-classic';
import { SearchTaskPipe } from '../search-task.pipe';
import { config } from '../config';
import * as moment from 'moment';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['../project-detail/project-detail.component.css'],

})
export class ChildComponent implements OnInit {

  name;
  @Input() projectId;
  @Input() developers;
  @Input() tracks;
  task: any;
  // @Output() task : EventEmitter<any> = new EventEmitter();
  @Output() trackDrop: EventEmitter<any> = new EventEmitter();
  @Output() talkDrop: EventEmitter<any> = new EventEmitter();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));


  public model = {
    editorData: ''
  };
  taskId;
  url = [];
  commentUrl = [];
  newTask = { title: '', desc: '', assignTo: '', status: 'to do', priority: '', dueDate: '', estimatedTime: '', images: [], sprint: '' };
  modalTitle; 3
  project;
  tasks;
  comments;
  comment;
  developerId;
  allStatusList = this._projectService.getAllStatus();
  allPriorityList = this._projectService.getAllProtity();
  editTaskForm: FormGroup;
  loader: boolean = false;
  currentDate = new Date();
  pro;
  id;
  files: Array<File> = [];
  path = config.baseMediaUrl;
  searchText;
  projectTeam;
  Teams;
  selectedProjectId = "all";
  selectedDeveloperId = "all";
  sprints;
  timeLog;
  logs;
  diff;
  counter: number;
  taskdata;
  startText = 'START';
  time: any;
  assignTo;
  taskArr = [];
  running: boolean = false;
  timerRef;
  initialTime = 0;
  trackss: any;
  currentsprintId;
  newSprint = [];
  commentImg: any;
  temp;
  difference;
  file = [];
  count;
  priority: boolean = false;
  sorting;

  submitted = false;
  isTaskFound = false;
  isDisable: boolean = false;



  constructor(private route: ActivatedRoute, public _projectService: ProjectService,
    public _commentService: CommentService, public _change: ChangeDetectorRef, public searchTextFilter: SearchTaskPipe, private router: Router) {

    this.route.params.subscribe(param => {
      this.projectId = param.id;
    });

    this._projectService.AddTask.subscribe(data => {
      if (data == 'AddTask') {
        this.getProject(this.projectId);
      }
    })

    // this.getSprint(this.projectId);
    // this.getSprintWithoutComplete(this.projectId);
    // this.getProject(this.projectId);
    this.createEditTaskForm();

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.func('reload');
      }
    });
  }
  ngOnInit() {

    this.getProject(this.projectId);
    console.log(this.tracks, this.developers);
    this.getSprint(this.projectId);
    this.getSprintWithoutComplete(this.projectId);

    window.addEventListener('beforeunload', function (e) {
      // Cancel the event
      if (localStorage.getItem('isTimerRunning') != "null") {
        console.log("EVENT", e);
        console.log("EVENT", localStorage.getItem('isTimerRunning'));
        console.log("EVENT", localStorage.getItem('runningStatus'));
        fromReload('reload');

        e.stopPropagation();
        // Chrome requires returnValue to be set
        e.returnValue = '';

      }
    });
    var fromReload = (option) => {
      this.func(option);
    }

  }

  func = async (option) => {
    // debugger;
    console.log("in func", option);
    console.log("EVENT", localStorage.getItem('isTimerRunning'));
    var taskId = localStorage.getItem('isTimerRunning');
    console.log('taskId===========>', taskId);
    let isAnyTrackHasTask = false;
    await _.forEach(this.tracks, async (track) => {
      console.log('track =================>', track);
      if (track.tasks.length) {
        isAnyTrackHasTask = true;

      }

      await _.forEach(track.tasks, (task) => {
        console.log("===========================taskk====================", task)
        if (task._id == taskId) {
          console.log('taskkkkkkkkkkkkkkkk=================>', task);
          if (option == 'reload')
            this.timerUpdate(task);
          else if (option == 'load')
            this.startTimer(task);
        }

      })
    })
    if (isAnyTrackHasTask) this.isTaskFound = true;
  }



  ngOnChanges() {
    this._change.detectChanges();
    console.log("ngOnChanges()  ===============================", this.tracks);
  }



  getEmptyTracks() {
    console.log("user=====================>", this.currentUser.userRole);
    if (this.currentUser.userRole == "projectManager" || this.currentUser.userRole == "admin") {

      this.tracks = [
        {
          "icon": "icon-notebook",
          "title": "Todo",
          "id": "to do",
          "class": "primary",
          "tasks": [

          ]
        },
        {
          "icon": "icon-equalizer",
          "title": "In Progress",
          "id": "in progress",
          "class": "info",
          "tasks": [

          ]
        },
        {
          "icon": "icon-settings",
          "title": "Testing",
          "id": "testing",
          "class": "warning",
          "tasks": [

          ]
        },
        {
          "icon": "icon-like",
          "title": "Done",
          "id": "complete",
          "class": "success",
          "tasks": [

          ]
        }
      ];
      console.log("tracks====-=-_+_++ of child component", this.tracks);
    }
    else {
      this.tracks = [
        {
          "title": "Todo",
          "id": "to do",
          "class": "primary",
          "tasks": [

          ]
        },
        {
          "title": "In Progress",
          "id": "in progress",
          "class": "info",
          "tasks": [

          ]
        },
        {
          "title": "Testing",
          "id": "testing",
          "class": "warning",
          "tasks": [

          ]
        }
      ];
      console.log("tracks====-=-_+_++", this.tracks);

    }
  }

  getPriorityClass(priority) {
    switch (Number(priority)) {
      case 4:
        return { class: "primary", title: "Low" }
        break;

      case 3:
        return { class: "warning", title: "Medium" }
        break;

      case 2:
        return { class: "success", title: "High" }
        break;


      case 1:
        return { class: "danger", title: "Highest" }
        break;

      default:
        return ""
        break;
    }
  }

  createEditTaskForm() {
    this.editTaskForm = new FormGroup({
      title: new FormControl('', Validators.required),
      desc: new FormControl('', Validators.required),
      assignTo: new FormControl('', Validators.required),
      sprint: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl(''),
      dueDate: new FormControl(''),
      status: new FormControl({ value: '', disabled: true }, Validators.required),
      files: new FormControl(),
      estimatedTime: new FormControl()
    })
  }

  getTitle(name) {
    if (name) {
      var str = name.split(' ');
      if (str.length > 1)
        return str[0].charAt(0).toUpperCase() + str[0].slice(1) + ' ' + str[1].charAt(0).toUpperCase() + str[1].slice(1);
      else
        return str[0].charAt(0).toUpperCase() + str[0].slice(1)
    } else {
      return '';
    }
  }

  getInitialsOfName(name) {
    if (name) {
      var str = name.split(' ')[0][0] + name.split(' ')[1][0];
      return str.toUpperCase();
    } else {
      return '';
    }
  }

  get trackIds(): string[] {
    return this.tracks.map(track => track.id);
  }

  onTrackDrop(event) {
    this.trackDrop.emit(event);
  }
  onTalkDrop(event) {
    if (this.startText == 'Stop') {
    }
    this.talkDrop.emit(event);
  }
  ondrag(task) {
    console.log(task);
  }

  public Editor = DecoupledEditor;
  public configuration = { placeholder: 'Enter Comment Text...' };
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  public onChange({ editor }: ChangeEvent) {
    const data = editor.getData();
    this.comment = data;
  }
  sendComment(taskId) {
    this.isDisable = true;
    // this.func('reload');
    console.log(this.comment);
    var data: any;
    if (this.files.length > 0) {
      data = new FormData();
      data.append("content", this.comment ? this.comment : "");
      data.append("userId", this.currentUser._id);
      data.append("projectId", this.projectId);
      data.append("taskId", taskId);
      // data.append("Images",this.images);
      for (var i = 0; i < this.files.length; i++)
        data.append('fileUpload', this.files[i]);
    } else {
      data = { content: this.comment, userId: this.currentUser._id, taskId: taskId };
    }
    console.log(data);
    this._commentService.addComment(data).subscribe((res: any) => {
      console.log(res);
      // console.log('this.files===============>',this.files);
      // this.files = [];
      // console.log('this.files=======>',this.files);
      this.commentImg = res;
      this.commentUrl = [];
      this.comment = "";
      this.model.editorData = 'Enter comments here';
      this.files = [];
      this.file = [];
      console.log('this.files=============>', this.files);
      this.isDisable = false;
      this.getAllCommentOfTask(res.taskId);
    }, err => {
      console.error(err);
      this.isDisable = false;
    });
  }

  getAllCommentOfTask(taskId) {
    this._commentService.getAllComments(taskId).subscribe(res => {
      this.comments = res;
      console.log('comments===============>', this.comments);
    }, err => {
      console.error(err);
    })
  }
  onSelectFile(event, option) {
    _.forEach(event.target.files, (file: any) => {
      this.files.push(file);
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        if (option == 'item')
          this.url.push(e.target.result);
        if (option == 'comment')
          this.commentUrl.push(e.target.result);
      }
    })
  }
  removeAvatar(file, index) {
    console.log(file, index);
    this.url.splice(index, 1);
    if (this.files && this.files.length)
      this.files.splice(index, 1);
    console.log(this.files);
  }
  removeCommentImage(file, index) {
    console.log(file, index);
    this.commentUrl.splice(index, 1);
    if (this.files && this.files.length)
      this.files.splice(index, 1);
    console.log(this.files);
  }
  removeCommentImage1(file, index) {
    console.log(file, index);
    this.file.splice(index, 1);
    if (this.files && this.files.length)
      this.files.splice(index, 1);
    console.log(this.files);
  }
  removeAlreadyUplodedFile(option) {
    this.newTask.images.splice(option, 1);
  }
  openModel(task) {
    console.log(task);
    this.task = task;
    console.log(task.status);
    this.getAllCommentOfTask(task._id);
    $('#fullHeightModalRight').modal('show');

  }
  editTask(task) {
    this.newTask = task;
    console.log("newTask", this.newTask);
    console.log("title===>", this.newTask.title);
    console.log("title2===>", this.newTask.assignTo);
    // console.log("title3===>",this.newTask.sprint);
    this.modalTitle = 'Edit Item';
    $('#itemManipulationModel1').modal('show');
    this.getProject(task.projectId._id);
  }
  focusOnTextArea(comment) {
    $('.ck.ck-content.ck-editor__editable').focus();
    console.log("click===========>", comment);
    this.model.editorData = "<blockquote><q>" + comment.content + "</q></blockquote><p></p>"
  }
  updateStatus(newStatus, data) {
    if (newStatus == 'complete') {
      data.status = newStatus;
      this._projectService.completeItem(data).subscribe((res: any) => {
        console.log(res);
        var n = res.timelog.length
        Swal.fire({
          type: 'info',
          title: "Task is shifted to complete from testing",
          showConfirmButton: false, timer: 2000
        })
        this.getProject(this.projectId);
      }, err => {
        Swal.fire('Oops...', 'Something went wrong!', 'error')
        console.log(err);
      });
    } else {
      data.status = newStatus;
      console.log("UniqueId", data.uniqueId);
      this._projectService.updateStatus(data).subscribe((res: any) => {
        console.log(res);
        // this.getProject(res.projectId);
        var n = res.timelog.length;
        let uniqueId = res.uniqueId;

        Swal.fire({
          type: 'info',
          title: uniqueId + " " + res.timelog[n - 1].operation,
          showConfirmButton: false, timer: 3000
        })
        this.getProject(this.projectId);
      }, (err: any) => {
        Swal.fire('Oops...', 'Something went wrong!', 'error')
        console.log(err);
      })
    }
  }

  get f() { return this.editTaskForm.value; }


  // saveTheData(task){

  //   this.submitted = true;
  //   if (this.editTaskForm.invalid) {
  //     return;
  //   }
  //   this.loader = true;
  //   task['projectId']= this.projectId;
  //   console.log("projectId=========>",this.projectId);
  //   task.priority = Number(task.priority); 
  //   task['type']= _.includes(this.modalTitle, 'Task')?'TASK':_.includes(this.modalTitle, 'Bug')?'BUG':_.includes(this.modalTitle, 'Issue')?'ISSUE':''; 
  //   console.log("estimated time=====>",task.estimatedTime);
  //   // task.images = $("#images").val();
  //   console.log("images====>",task.images);
  //   console.log(task.dueDate);
  //   task.dueDate = moment().add(task.dueDate, 'days').format('YYYY-MM-DD');
  //   task['createdBy'] = JSON.parse(localStorage.getItem('currentUser'))._id;
  //   console.log("task ALL details",task);
  //   let data = new FormData();
  //   _.forOwn(task, function(value, key) {
  //     data.append(key, value)
  //   });
  //   if(this.files.length>0){
  //     for(var i=0;i<this.files.length;i++){
  //       data.append('fileUpload', this.files[i]);  
  //     }
  //   }
  //   this._projectService.addTask(data).subscribe((res:any)=>{
  //     console.log("response task***++",res);
  //     let name = res.assignTo.name;
  //     console.log("assign to name>>>>>>>>>>>><<<<<<<<",name);
  //     Swal.fire({type: 'success',
  //       title: 'Task Added Successfully to',
  //       text: name,
  //       showConfirmButton:false,
  //       timer: 2000,
  //       // position: 'top-end'
  //     })
  //     this.getProject(res.projectId._id);
  //     $('#save_changes').attr("disabled", false);
  //     $('#refresh_icon').css('display','none');
  //     $('#itemManipulationModel').modal('hide');
  //     this.newTask = this.getEmptyTask();
  //     this.editTaskForm.reset();
  //     this.files = this.url = [];
  //     // this.assignTo.reset();
  //     this.loader = false;
  //   },err=>{
  //     Swal.fire({
  //       type: 'error',
  //       title: 'Ooops',
  //       text: 'Something went wrong',
  //       animation: false,
  //       customClass: {
  //         popup: 'animated tada'
  //       }
  //     })
  //     //$('#alert').css('display','block');
  //     console.log("error========>",err);
  //   });
  // }


  updateTask(task) {
    this.isDisable = true;
    task.assignTo = this.editTaskForm.value.assignTo;
    task.sprint = this.editTaskForm.value.sprint;
    console.log("assignTo", task.assignTo);
    let data = new FormData();
    data.append('projectId', task.projectId);
    data.append('title', task.title);
    data.append('desc', task.desc);
    data.append('assignTo', task.assignTo);
    data.append('sprint', task.sprint);
    data.append('priority', task.priority);
    data.append('dueDate', task.dueDate);
    data.append('estimatedTime', task.estimatedTime);
    data.append('images', task.images);
    if (this.files.length > 0) {
      for (var i = 0; i < this.files.length; i++) {
        data.append('fileUpload', this.files[i]);
      }
    }
    console.log("update =====>", task);
    this._projectService.updateTask(task._id, data).subscribe((res: any) => {
      let taskNo = res.uniqueId;
      console.log("updated tassssssssskkkkkkkkkk>>>>>>><<<<<<<", taskNo);
      Swal.fire({
        type: 'success',
        title: taskNo + " updated successfully",
        showConfirmButton: false,
        timer: 2000,
        // position: 'top-end',
      })
      this.isDisable = false;
      $('#save_changes').attr("disabled", false);
      $('#refresh_icon').css('display', 'none');
      $('#itemManipulationModel1').modal('hide');
      $('#fullHeightModalRight').modal('hide');
      this.getProject(this.projectId);
      var cardid = '#' + 'cardId_' + taskNo;
      console.log('cardid=======================================>', cardid);
      setTimeout(() => {
        $(cardid).css({ "background-color": "#F5F5F5" });

      }, 2000)
      this.newTask = this.getEmptyTask();
      this.files = this.url = [];
      this.editTaskForm.reset();
      this.loader = false;

    }, err => {
      Swal.fire('Oops...', 'Something went wrong!', 'error')
      console.log(err);
      this.loader = false;

    })
  }
  getEmptyTask() {
    return { title: '', desc: '', assignTo: '', status: 'to do', sprint: '', priority: 'low', dueDate: '', estimatedTime: '', images: [] };
  }
  getHHMMTime(difference) {
    // console.log("ave che kai ke nai",difference);
    if (difference != '00:00') {
      difference = difference.split("T");
      difference = difference[1];
      difference = difference.split(".");
      difference = difference[0];
      difference = difference.split(":");
      var diff1 = difference[0];
      // console.log("ahi j zero mde che",diff1);
      var diff2 = difference[1];

      difference = diff1 + ":" + diff2;
      // console.log("fhuidsifgidif",difference);
      return difference;
    }
    return '00:00';
  }
  getTime(counter) {
    var milliseconds = ((counter % 1000) / 100),
      seconds = Math.floor((counter / 1000) % 60),
      minutes = Math.floor((counter / (1000 * 60)) % 60),
      hours = Math.floor((counter / (1000 * 60 * 60)) % 24);
    return hours + ":" + minutes + ":" + seconds;
  }
  deleteTask(taskId) {
    console.log("taskId of delete button", taskId);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "'You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancle!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._projectService.deleteTaskById(this.task).subscribe((res: any) => {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Task ' + this.task.uniqueId + ' has been deleted.',
            'success'
          )
          $('#exampleModalPreview').modal('hide');
          $('#itemManipulationModel1').modal('hide');
          $('#fullHeightModalRight').modal('hide');
          this.getProject(this.projectId);

          console.log("Delete Task======>", res);
          this.task = res;
          console.log("response of deleted task", this.task);
          this.func('reload');
        }, (err: any) => {
          Swal.fire({
            type: 'error',
            title: 'Ooops',
            text: 'Something went wrong',
            animation: false,
            customClass: {
              popup: 'animated tada'
            }
          })
          console.log("error in delete Task=====>", err);
        });
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancled!',
          'Your task has been safe.',
          'error'
        )
      }
    })
  }


  // getProject(id){
  //   console.log("projectId=====>",this.projectId);
  //   this.loader = true;
  //   setTimeout(()=>{
  //     this._projectService.getProjectById(this.projectId).subscribe((res:any)=>{
  //       console.log("title=={}{}{}{}{}",res);
  //       this.temp = res;
  //       this.pro = res;
  //       console.log("project detail===>>>>",this.pro);
  //       this.projectId=this.pro._id;
  //       console.log("iddddd====>",this.projectId);
  //       this._projectService.getTeamByProjectId(this.projectId).subscribe((res:any)=>{
  //         // res.Teams.push(...this.pro.pmanagerId); 
  //         console.log("response of team============>"  ,res.Teams);
  //         this.projectTeam = res.Teams;
  //         console.log("team members od project=========",this.projectTeam);
  //         this.loader = false;
  //       },(err:any)=>{
  //         console.log("err of team============>"  ,err);
  //       });
  //     },(err:any)=>{
  //       console.log("err of project============>"  ,err);
  //     });

  //     this._projectService.getTaskById(this.projectId).subscribe((res:any)=>{
  //       console.log("all response ======>" , res);
  //       this.getEmptyTracks();
  //       this.project = res;
  //       console.log("PROJECT=================>", this.project);
  //       _.forEach(this.project , (task)=>{
  //          console.log("task of child component ======>" , task);
  //         _.forEach(this.tracks , (track)=>{
  //         console.log("tracks==-=-=-=- of project-details component",this.tracks);

  //           console.log("track in foreach",task.sprint.status);

  //           if(this.currentUser.userRole!='projectManager' && this.currentUser.userRole!='admin'){
  //             if(task.status == track.id && task.assignTo && task.assignTo._id == this.currentUser._id && this.currentUser.userRole == 'developer' ){
  //               track.tasks.push(task);
  //             }
  //           }
  //           else if (task.status == track.id ){
  //               track.tasks.push(task);
  //           }
  //           else{
  //                if(task.status == track.id && task.sprint.status == 'Active'){
  //               track.tasks.push(task);
  //             }
  //           }
  //         })
  //       })

  //       console.log("This Tracks=========>>>>>",this.tracks);
  //       this.temp =  this.tracks; 
  //       this.loader = false;
  //       this.func('load');

  //     },err=>{
  //       console.log(err);
  //       this.loader = false;
  //     })
  //   },1000);
  //   function custom_sort(a, b) {
  //     return new Date(new Date(a.createdAt)).getTime() - new Date(new Date(b.createdAt)).getTime();
  //   }  
  // }


  getProject(id) {
    console.log("projectId=====>", this.projectId);
    this.loader = true;
    setTimeout(() => {
      this._projectService.getProjectById(this.projectId).subscribe((res: any) => {
        console.log("title=={}{}{}{}{}", res);
        this.temp = res;
        this.pro = res;
        console.log("project detail===>>>>", this.pro);
        this.projectId = this.pro._id;
        console.log("iddddd====>", this.projectId);
        this._projectService.getTeamByProjectId(this.projectId).subscribe((res: any) => {
          console.log("response of team============>", res.Teams);
          this.projectTeam = res.Teams;
          console.log("team members od project=========", this.projectTeam);
          this.loader = false;
        }, (err: any) => {
          console.log("err of team============>", err);
        });
      }, (err: any) => {
        console.log("err of project============>", err);
      });

      this._projectService.getTaskById(this.projectId).subscribe((res: any) => {
        console.log("all response ======>", res);
        this.getEmptyTracks();
        this.project = res;
        console.log("PROJECT=================>", this.project);
        _.forEach(this.project, (task) => {
          console.log("task of child component ======>", task);
          _.forEach(this.tracks, (track) => {
            console.log("tracks==-=-=-=- of project-details component", this.tracks);
            console.log("track in foreach", task.sprint.status);
            if (task.sprint.status == 'Active' || task.sprint.status == 'Future') {
              if (this.currentUser.userRole != 'projectManager' && this.currentUser.userRole != 'admin') {
                if (task.status == track.id && task.assignTo && task.assignTo._id == this.currentUser._id && this.currentUser.userRole == 'developer') {
                  track.tasks.push(task);
                }
              } else if (task.status == track.id) {
                track.tasks.push(task);
              } else if (task.status == track.id && task.sprint.status == 'Active') {
                track.tasks.push(task);
              }
            }
          })
        })
        console.log("This Tracks=========>>>>>", this.tracks);
        this.temp = this.tracks;
        this.loader = false;
        this.func('load');
      }, err => {
        console.log(err);
        this.loader = false;
      })
    }, 1000);
    function custom_sort(a, b) {
      return new Date(new Date(a.createdAt)).getTime() - new Date(new Date(b.createdAt)).getTime();
    }
  }


  getSprint(projectId) {
    this._projectService.getSprint(projectId).subscribe((res: any) => {
      console.log("sprints in project detail=====>>>>", res);
      this.sprints = res;
    }, (err: any) => {
      console.log(err);
    });

  }

  startTimer(data) {
    console.log('task data================>', data);
    this.running = !this.running;
    data['running'] = data.running ? !data.running : true;
    console.log(data.running);
    if (data.running) {
      data['startText'] = 'STOP';
      var startTime = Date.now() - (data.timelog1 ? data.timelog1.count : this.initialTime);
      // console.log("startTime=======>",startTime);
      data['timerRef'] = setInterval(() => {
        data.timelog1['count'] = Date.now() - startTime;
        var milliseconds = ((data.timelog1.count % 1000) / 100),
          seconds = Math.floor((data.timelog1.count / 1000) % 60),
          minutes = Math.floor((data.timelog1.count / (1000 * 60)) % 60),
          hours = Math.floor((data.timelog1.count / (1000 * 60 * 60)) % 24);
        // console.log('hours + ":" + minutes + ":" + seconds',hours + ":" + minutes + ":" + seconds);
        this.time = hours + ":" + minutes + ":" + seconds;
        data['time'] = this.time;

      });
      window.localStorage.setItem("isTimerRunning", data._id);
      window.localStorage.setItem("runningStatus", data.running);
    } else {
      data.startText = 'RESUME';

      window.localStorage.setItem("isTimerRunning", "null");
      console.log("res-=-=", data.timelog1.count);
      clearInterval(data.timerRef);
    }
    this.timerUpdate(data);
  }

  timerUpdate(data) {
    this.taskdata = data;
    console.log('data===========>', this.taskdata);
    this._projectService.addTimeLog(this.taskdata).subscribe((res: any) => {
      console.log('res=============>', res);
      this.timeLog = res;
      console.log('this.timeLog', this.timeLog.difference);
      this.logs = res.log;

    }, (err: any) => {
      console.log(err);
    });

  }

  getSprintWithoutComplete(projectId) {
    this._projectService.getSprint(projectId).subscribe((res: any) => {
      this.sprints = res;
      _.forEach(this.sprints, (sprint) => {
        if (sprint.status !== 'Complete') {
          console.log("sprint in if", sprint);
          this.newSprint.push(sprint);
          console.log("res-=-=", this.newSprint);
        }
      })
    }, (err: any) => {
      console.log(err);
    });
  }

  changeFile(event) {
    console.log(event);
    this.files = event;
  }


  sortTasksByDueDate(type) {
    if (this.priority == true) {
      console.log('Sorting array======================>', this.sorting);
      console.log("Sorting tasks by dueDate = ", type)
      _.forEach(this.sorting, function (track) {
        console.log("Sorting track = ", track.title);
        track.tasks.sort(custom_sort);
        // track.tasks.sort(custom_sort1);
        if (type == 'desc') {
          track.tasks.reverse();
        }
        console.log("sorted output======== =====> ", track.tasks);
      });
    } else {
      console.log("Sorting tasks byDueDate = ", type)

      _.forEach(this.tracks, function (track) {
        console.log("Sorting track =()()() ", track.title);
        track.tasks.sort(custom_sort);
        if (type == 'desc') {
          track.tasks.reverse();
        }
        console.log("sorted output =><>?????)_)_)_ ", track.tasks);
      });
      // }
    }

    function custom_sort(a, b) {
      // var   Aarr = a.dueDate.split(" ");
      // a.dueDate = Aarr[0];
      // var   Barr = b.dueDate.split(" ");
      // b.dueDate = Barr[0];
      return new Date(new Date(a.dueDate)).getTime() - new Date(new Date(b.dueDate)).getTime();
    }
    function custom_sort1(a, b) {
      return a.priority - b.priority;
    }

    console.log("sorting======>", custom_sort);
    $(".due_date_sorting_btn i.fas").toggleClass("hide");
  }
  sortTasksByPriority(type) {
    this.priority = true;
    console.log("sort by priority", type);
    _.forEach(this.tracks, function (track) {
      console.log("Sorting track = ", track.title);
      track.tasks.sort(custom_sort1);
      if (type == 'desc') {
        track.tasks.reverse();
      }
      console.log("sorted output =====> ", track.tasks);
    });
    this.sorting = this.tracks;
    console.log('jkfdhdfjkghd============================>', this.sorting);

    function custom_sort1(a, b) {
      return a.priority - b.priority;
    }
    console.log("nthi avtu=======>", custom_sort1);
    $(".priority_sorting_btn i.fas").toggleClass("hide");
  }


}