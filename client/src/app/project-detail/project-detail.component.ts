import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../services/project.service';
import { AlertService } from '../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { SearchTaskPipe } from '../search-task.pipe';
import { ChildComponent } from '../child/child.component';
import { config } from '../config'
import { LeaveComponent } from '../leave/leave.component';
import * as _ from 'lodash';
import { CommentService } from '../services/comment.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
declare var $: any;


@Component({
	selector: 'app-project-detail',
	templateUrl: './project-detail.component.html',
	styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
	tracks: any;
	modalTitle;
	comments: any;
	public model = {
		editorData: ''
	};
	url = [];
	commentUrl = [];
	searchText;
	newTask = { title: '', desc: '', assignTo: '', sprint: '', status: 'to do', priority: 'low', dueDate: '', estimatedTime: '', images: [] };
	task;
	tasks;
	taskId;
	projects: any;
	project;
	comment;
	projectId;
	allStatusList = this._projectService.getAllStatus();
	allPriorityList = this._projectService.getAllProtity();
	editTaskForm;
	assignTo;
	developers: any
	loader: boolean = false;
	currentDate = new Date();
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	currentsprintId;
	pro;
	asc;
	desc;
	id;
	projectTeam;
	sprints;
	newSprint = [];
	sprintStatus = [];
	Teams;
	files: Array<File> = [];
	path = config.baseMediaUrl;
	priority: boolean = false;
	sprint;
	sorting: any;
	temp: any;
	activeSprint: any;
	sprintInfo: any;
	submitted = false;
	isDisable: boolean = false;
	projectTitle;

	constructor(public _projectService: ProjectService, private route: ActivatedRoute,
		public _alertService: AlertService, public searchTextFilter: SearchTaskPipe,
		public _commentService: CommentService, public _change: ChangeDetectorRef) {
		$('.datepicker').pickadate();
		this.route.params.subscribe(param => {
			this.projectId = param.id;
			this.getEmptyTracks();
			this.getProject(this.projectId);
		});
		this.createEditTaskForm();

	}

	getEmptyTracks() {
		console.log("user=====================>", this.currentUser.userRole);
		if (this.currentUser.userRole == "projectManager" || this.currentUser.userRole == "admin") {

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
				},
				{
					"title": "Done",
					"id": "complete",
					"class": "success",
					"tasks": [

					]
				}
			];
			console.log("tracks====-=-_+_++", this.tracks);
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
			title: new FormControl('', [Validators.required]),
			desc: new FormControl('', [Validators.required]),
			assignTo: new FormControl('', Validators.required),
			sprint: new FormControl('', Validators.required),
			priority: new FormControl('', Validators.required),
			dueDate: new FormControl(''),
			estimatedTime: new FormControl('', [Validators.required]),
			status: new FormControl({ value: 'to do', disabled: true }, Validators.required),
			// files : new FormControl()
		})
	}

	ngOnInit() {
		setTimeout(() => {

			$('[data-toggle="popover-hover"]').popover({
				html: true,
				trigger: 'hover',
				placement: 'bottom',
				content: "<ul type=none ><li>" + 'Start-date : ' + "<strong>" + this.sprintInfo.startDate + "</strong></li>" + "<li>" + 'End-date : ' + "<strong>" + this.sprintInfo.endDate + "</strong></li>" + "<li>" + 'Sprint-duration : ' + "<strong>" + this.sprintInfo.duration + ' days' + "</strong></li></ul>"
			});
		}, 2000);
		$('.datepicker').pickadate();
		// $('#estimatedTime').pickatime({});

		$(function () {
			$('[data-toggle="tooltip"]').tooltip()
		});
		$('#save_changes').on('click', function () {
			$('#save_changes').attr("disabled", true);
			$('#refresh_icon').css('display', 'block');
		});

		// this.filterTracks(this.activeSprint._id);
		this.getSprint(this.projectId);
		this.getSprintWithoutComplete(this.projectId);
		this.getProject(this.projectId);
		this.gettrackdisplay(this.projectId);
	}




	filterTracks(sprintId) {
		console.log("tem ====>", this.temp);
		this.getEmptyTracks();
		this.currentsprintId = sprintId;
		console.log("sprintId==============>>>>>>><<<<<<<<<", this.currentsprintId);
		_.forEach(this.project, (task) => {
			console.log("tasks-------------------", task)
			_.forEach(this.tracks, (track) => {
				if (task.sprint._id == sprintId && track.id == task.status) {
					track.tasks.push(task);
				}
			})
		})
	}

	getAllDevelopers() {
		this._projectService.getAllDevelopers().subscribe(res => {
			this.developers = res;
			this.developers.sort(function (a, b) {
				if (name) {

					var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
					if (nameA < nameB) //sort string ascending
						return -1
					if (nameA > nameB)
						return 1
					return 0 //default return value (no sorting)
				}
			})
			console.log("Developers", this.developers);
		}, err => {
			console.log("Couldn't get all developers ", err);
			this._alertService.error(err);
		})

	}

	gettrackdisplay(id) {
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

					if (this.currentUser.userRole != 'projectManager' && this.currentUser.userRole != 'admin') {
						if (task.status == track.id && task.assignTo && task.assignTo._id == this.currentUser._id && this.currentUser.userRole == 'developer') {
							track.tasks.push(task);
						}
					} else {
						if (task.status == track.id) {
							track.tasks.push(task);
						}
					}
				})
			})
			console.log("This Tracks=========>>>>>", this.tracks);
			this.temp = this.tracks;
			this.loader = false;
		}, err => {
			console.log(err);
			this.loader = false;
		})
	}
	getProject(id) {
		console.log("projectId=====>", this.projectId);
		this.loader = true;
		setTimeout(() => {
			this._projectService.getProjectById(this.projectId).subscribe((res: any) => {
				console.log("title=={}{}{}{}{}", res);
				this.temp = res;
				this.pro = res;
				this.projectTitle = res;
				console.log("project detail title===>>>>", this.projectTitle);
				this.projectId = this.pro._id;
				console.log("iddddd====>", this.projectId);
				this._projectService.getTeamByProjectId(this.projectId).subscribe((res: any) => {
					// res.Teams.push(...this.pro.pmanagerId); 
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

						if (this.currentUser.userRole != 'projectManager' && this.currentUser.userRole != 'admin') {
							if (task.status == track.id && task.assignTo && task.assignTo._id == this.currentUser._id && this.currentUser.userRole == 'developer') {
								track.tasks.push(task);
							}
						}
						else if (task.status == track.id && task.sprint.status == 'Complete') {
							track.tasks.push(task);
						}
						else {
							if (task.status == track.id && task.sprint.status == 'Active') {
								track.tasks.push(task);
							}
						}
					})
				})

				console.log("This Tracks=========>>>>>", this.tracks);
				this.temp = this.tracks;
				this.loader = false;
			}, err => {
				console.log(err);
				this.loader = false;
			})
		}, 1000);
		function custom_sort(a, b) {
			return new Date(new Date(a.createdAt)).getTime() - new Date(new Date(b.createdAt)).getTime();
		}
	}

	get trackIds(): string[] {
		return this.tracks.map(track => track.id);
	}

	onTalkDrop(event: CdkDragDrop<any>) {
		console.log(event.container.id, event.previousContainer.data, event);
		// if(task.sprint.status == 'Active'){

		// }

		// for(var i=0;i<event.previousContainer.data.length;i++){
		// 	this.sprintStatus.push(event.previousContainer.data[_.findIndex(event.previousContainer.data, { 'status': event.previousContainer.id })].sprint.status)
		// 	console.log("status========>",this.sprintStatus);
		if (event.previousContainer.data[_.findIndex(event.previousContainer.data, { '_id': event.item.element.nativeElement.id })].sprint.status == 'Active') {
			console.log("hello");
			console.log(this.sprintStatus);
			console.log(event);
			if (event.previousContainer.data[_.findIndex(event.previousContainer.data, { 'status': event.previousContainer.id })].running) {
				Swal.fire('Oops...', 'Stop timer!', 'error')
			} else {
				if (event.previousContainer === event.container) {
					moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
				} else {
					transferArrayItem(event.previousContainer.data,
						event.container.data,
						event.previousIndex,
						event.currentIndex);
					this.updateStatus(event.container.id, event.container.data[_.findIndex(event.container.data, { 'status': event.previousContainer.id })]);

				}
			}
		} else {
			Swal.fire({
				type: 'error',
				title: 'Sorry!',
				text: "Project's Sprint is not activated",
				animation: false,
				customClass: {
					popup: 'animated tada'
				}
			})
			console.log("hi");
		}
		// }


	}

	onTrackDrop(event: CdkDragDrop<any>) {
		console.log('event in ontrackdrop================>', event);
		moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
	}
	updateStatus(newStatus, data) {

		if (newStatus == 'complete') {
			data.status = newStatus;
			this._projectService.completeItem(data).subscribe((res: any) => {
				console.log(res);
				var n = res.timelog.length
				Swal.fire({
					type: 'info',
					title: "Task is shifted to Complete from Testing",
					showConfirmButton: false, timer: 2000
				})
			}, err => {
				Swal.fire('Oops...', 'Something went wrong!', 'error')
				console.log(err);
			});
		} else {
			data.status = newStatus;
			console.log("UniqueId", data.uniqueId);
			this._projectService.updateStatus(data).subscribe((res: any) => {
				console.log(res);
				console.log(res.sprint);
				// this.getProject(res.projectId);
				var n = res.timelog.length;
				let uniqueId = res.uniqueId;

				Swal.fire({
					type: 'info',
					title: uniqueId + " " + res.timelog[n - 1].operation,
					showConfirmButton: false, timer: 3000
				})
			}, (err: any) => {
				Swal.fire('Oops...', 'Something went wrong!', 'error')
				console.log(err);
			})

		}

	}


	ngOnDestroy() {
		this._change.detach();
	}

	getTitle(name) {
		if (name) {
			var str = name.split(' ');
			return str[0].charAt(0).toUpperCase() + str[0].slice(1) + ' ' + str[1].charAt(0).toUpperCase() + str[1].slice(1);
		} else {
			return '';
		}
	}

	getInitialsOfName(name) {
		if (name) {
			var str = name.split(' ')[0][0] + name.split(' ')[1][0];
			return str.toUpperCase();
			// return name.split(' ')[0][0]+name.split(' ')[1][0];
		} else {
			return '';
		}
	}

	getColorCodeOfPriority(priority) {
		for (var i = 0; i < this.allPriorityList.length; i++) {
			if (this.allPriorityList[i].value == priority) {
				return this.allPriorityList[i].colorCode;
			}
		}

	}
	openModel(task) {
		console.log(task);
		this.task = task;
		this.getAllCommentOfTask(task._id);
		$('#fullHeightModalRight').modal('show');
	}

	editTask(task) {
		this.newTask = task;
		this.modalTitle = 'Edit Item';
		$('.datepicker').pickadate();
		$('#estimatedTime').pickatime({});
		$('#itemManipulationModel').modal('show');
	}

	getEmptyTask() {
		return { title: '', desc: '', assignTo: '', sprint: '', status: 'to do', priority: 'low', dueDate: '', estimatedTime: '', images: [] };
	}

	addItem(option) {
		this.newTask = { title: '', desc: '', assignTo: '', sprint: '', status: 'to do', priority: 'low', dueDate: '', estimatedTime: '', images: [] };
		this.modalTitle = 'Add ' + option;
		$('#itemManipulationModel').modal('show');
	}
	get f() { return this.editTaskForm.controls; }

	saveTheData(task) {
		console.log("data of foerm========>><<<<<<<<", task);
		console.log("data of foerm========>><<<<<<<<", this.editTaskForm);
		if (task.assignTo == '' || task.sprint == '' || task.priority == '' || task.dueDate == '' || task.estimatedTime == '') {
			Swal.fire({
				title: 'Error',
				text: "You can add required field first",
				type: 'warning',
			})
		} else {
			this.submitted = true;
			if (this.editTaskForm.invalid) {
				return;
			}
			this.isDisable = true;
			this.loader = true;
			task['projectId'] = this.projectId;
			console.log("projectId=========>", this.projectId);
			task.priority = Number(task.priority);
			task['type'] = _.includes(this.modalTitle, 'Task') ? 'TASK' : _.includes(this.modalTitle, 'Bug') ? 'BUG' : _.includes(this.modalTitle, 'Issue') ? 'ISSUE' : '';
			console.log("estimated time=====>", task.estimatedTime);
			console.log("images====>", task.images);

			console.log(task.dueDate);
			task.dueDate = moment().add(task.dueDate, 'days').format('YYYY-MM-DD');
			task['createdBy'] = JSON.parse(localStorage.getItem('currentUser'))._id;
			console.log("task ALL details", task);
			let data = new FormData();
			_.forOwn(task, function (value, key) {
				data.append(key, value)
			});
			if (this.files.length > 0) {
				for (var i = 0; i < this.files.length; i++) {
					data.append('fileUpload', this.files[i]);
				}
			}
			this._projectService.addTask(data).subscribe((res: any) => {
				console.log("response task***++", res);
				if (res) {
					let name = res.assignTo.name;
					console.log("assign to name>>>>>>>>>>>><<<<<<<<", name);
					Swal.fire({
						type: 'success',
						title: 'Task Added Successfully To',
						text: name,
						showConfirmButton: false,
						timer: 2000,
						// position: 'top-end'
					})
				} else {
					Swal.fire({
						type: 'success',
						title: 'please Task Added first',
						text: name,
						showConfirmButton: false,
						timer: 2000,
						// position: 'top-end'
					})
				}
				this.gettrackdisplay(res.projectId._id);
				console.log("display task list of only active sprint", this.gettrackdisplay);
				$('#save_changes').attr("disabled", false);
				$('#refresh_icon').css('display', 'none');
				$('#itemManipulationModel').modal('hide');
				this.newTask = this.getEmptyTask();
				this.editTaskForm.reset();
				this.files = this.url = [];
				// this.assignTo.reset();
				this.loader = false;
				this.isDisable = false;
				// this.editTaskForm.reset();
			}, err => {
				Swal.fire({
					type: 'error',
					title: 'Ooops',
					text: 'Something went wrong',
					animation: false,
					customClass: {
						popup: 'animated tada'
					}
				})
				this.isDisable = false;
				//$('#alert').css('display','block');
				console.log("error========>", err);
			});
		}
	}
	searchTask() {
		console.log("btn tapped");
	}
	onKey(searchText) {
		console.log("searchText", searchText);
		console.log(this.project);
		var dataToBeFiltered = [this.project];
		var task = this.searchTextFilter.transform(dataToBeFiltered, searchText);
		console.log("In Component", task);
		this.getEmptyTracks();
		_.forEach(task, (content) => {
			_.forEach(this.tracks, (track) => {
				if (this.currentUser.userRole != 'projectManager' && this.currentUser.userRole != 'admin') {
					if (content.status == track.id && content.assignTo && content.assignTo._id == this.currentUser._id) {
						// if(content.status == track.id){
						track.tasks.push(content);
					}

				}
				else {
					if (content.status == track.id) {
						track.tasks.push(content);
					}
				}
			});
		});
	}

	getAllProjects() {
		this._projectService.getProjects().subscribe(res => {
			this.projects = res;
		}, err => {
			this._alertService.error(err);
			console.log(err);
		})
	}
	getAllCommentOfTask(taskId) {
		this._commentService.getAllComments(taskId).subscribe(res => {
			this.comments = res;
		}, err => {
			console.error(err);
		})
	}

	onSelectFile(event, option) {
		_.forEach(event.target.files, (file: any) => {
			if (file.type == "image/png" || file.type == "image/jpeg" || file.type == "image/jpg") {
				this.files.push(file);
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = (e: any) => {
					if (option == 'item')
						this.url.push(e.target.result);
					if (option == 'comment')
						this.commentUrl.push(e.target.result);
				}
			} else {
				Swal.fire({
					title: 'Error',
					text: "You can upload Images only",
					type: 'warning',
				})
			}
		})
	}
	deleteTask(taskId) {
		console.log(taskId);
		this._projectService.deleteTaskById(this.task).subscribe((res: any) => {
			$('#exampleModalPreview').modal('hide');
			Swal.fire({ type: 'success', title: 'Task Deleted Successfully', showConfirmButton: false, timer: 2000 })
			console.log("Delete Task======>", res);
			this.task = res;
		}, (err: any) => {
			Swal.fire('Oops...', 'Something went wrong!', 'error')
			console.log("error in delete Task=====>", err);
		});
	}

	removeCommentImage(file, index) {
		console.log(file, index);
		this.commentUrl.splice(index, 1);
		if (this.files && this.files.length)
			this.files.splice(index, 1);
		console.log(this.files);
	}
	removeAlreadyUplodedFile(option) {
		this.newTask.images.splice(option, 1);
	}

	getSprint(projectId) {
		console.log("project is of this sprint", projectId);
		this._projectService.getSprint(projectId).subscribe((res: any) => {
			console.log("sprints in project detail=====>>>>", res);
			this.sprints = res;
			console.log("activated sprint detailssssssss", this.sprints);
			_.forEach(this.sprints, (sprint) => {
				if (sprint.status == 'Active' || sprint.status == 'Complete') {
					this.activeSprint = sprint;
					console.log("activated sprint of project=======>", this.activeSprint);
					this.sprintInfo = sprint;
					this.sprintInfo.startDate = moment(sprint.startDate).format('DD MMM YYYY');
					this.sprintInfo.endDate = moment(sprint.endDate).format('DD MMM YYYY');
					console.log("final sprint which display=========>>>>", this.activeSprint);
				}
			})
			// console.log("ActiveSprint startdate",this.activeSprint.endDate);
			var currendate = moment();
			var sprintEndDate = this.activeSprint.endDate;
			var date3 = moment(sprintEndDate);
			var duration = date3.diff(currendate, 'days');
			this.activeSprint.remainingDays = duration;
			console.log("currendate=======>>>", currendate);
			console.log("sprint end date=======>>>", sprintEndDate);
			console.log("remaining Days", duration);
		}, (err: any) => {
			console.log(err);
		});
	}

	completeSprint(sprintId) {
		console.log("Sprint ID=====>>>", sprintId);
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes,complete it!'
		}).then((result) => {
			if (result.value) {
				this._projectService.completeSprint(sprintId).subscribe((res: any) => {
					Swal.fire(
						'Complete!',
						'Your Sprint has been Completed.',
						'success'
					)
					console.log('res===========', res);
					// window.location.reload();
					this.getSprint(this.projectId);

				}, err => {
					console.log(err);
					Swal.fire('Oops...', 'Something went wrong!', 'error')
				})

			}
		})

	}

	getSprintWithoutComplete(projectId) {
		this._projectService.getSprint(projectId).subscribe((res: any) => {
			this.sprints = res;
			_.forEach(this.sprints, (sprint) => {
				if (sprint.status !== 'Complete') {
					this.newSprint.push(sprint);
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


}
