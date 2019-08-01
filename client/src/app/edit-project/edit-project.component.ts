import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import * as _ from "lodash";
declare var $ : any;
import { config } from '../config';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-edit-project',
	templateUrl: './edit-project.component.html',
	styleUrls: ['./edit-project.component.css']
}) 

export class EditProjectComponent implements OnInit {
	availableDevelopers:any;
	projectTeam:any = [];
	projectMngrTeam:any = [];
	availableProjectMngr = [];
	projects;
	editAvail;
	projectId;
	leavescount: any;
	dteam = [];
	updateForm:FormGroup;
	availData;
	developerShow = false;
	allDevelopers;
	availDevelopers;
	loader:boolean = false;
	showDeveloper:boolean = false;
	basMediaUrl = config.baseMediaUrl;
	developers;
	projectMngr;
	files: Array<File> = [];
	ProjectId;
	url = '';
	devId;
	submitted = false;
	projectAvatar = JSON.parse(localStorage.getItem('currentUser'));
	isDisable:boolean = false;
	// resetValue:boolean = false;
	currentUser = JSON.parse(localStorage.getItem('currentUser'));

	constructor(public router:Router, public _projectService: ProjectService, public route: ActivatedRoute, public _change: ChangeDetectorRef) {
		this.updateForm = new FormGroup({
			title: new FormControl('', [Validators.required,  Validators.maxLength(60)]),
			desc: new FormControl('', [Validators.required,  Validators.maxLength(300)]),
			uniqueId: new FormControl('' ),
			deadline: new FormControl(''),
			avatar:new FormControl(''),
			Teams: new FormControl([])
		});
		this.route.params.subscribe(params=>{
			this.ProjectId = params.id;
			this.getProjectById(this.ProjectId);
			this.getAllDevelopersNotInProject(params.id);
			this.getAllProjectManagerNotInProject(params.id);
			

		})
		if(this.projectId){
			this.getProject(this.projectId);		
		}
	}

	ngViewAfterChecked(){
		this._change.detectChanges();
	}
	ngOnDestroy(){
		this._change.detach();
	}
	
	ngOnInit() {

		$('#datepicker').pickadate({
			min: new Date(),
			onSet: function(context) {
				console.log('Just set stuff:.>>>>>>>>>><<<<<<<<<<<', context);
				setDate(context);
				change();
			}
		});
		var change:any = ()=>{
			this.updateForm.controls.deadline.setValue($('.datepicker').val());
		}

		var setDate = (context)=>{
			this.timePicked();
		}
		if(this.projectId){
			this.getProject(this.projectId);		
		}
		this.getProjects();
		this.getAllDevelopers();
		this.getAllProjectMngr();		
	}
	timePicked(){
		this.updateForm.controls.deadline.setValue($('#datepicker').val())
		console.log("deadline of projectttttttttt",this.updateForm.controls.deadline);
	}

	getAllDevelopers(){
		this._projectService.getAllDevelopers().subscribe(res=>{
			this.developers = res;
			console.log("dev{}{}{}",this.developers);
			this.developers.sort(function(a, b){
				if (name){
					var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
					if (nameA < nameB) //sort string ascending
						return -1 
					if (nameA > nameB)
						return 1
					return 0 
				}
			})
		},err=>{
			console.log("Couldn't get all developers ",err);
		})
	}

	getAllProjectMngr(){
		this._projectService.getAllProjectMngr().subscribe(res=>{
			this.projectMngr = res;
			this.projectMngr.sort(function(a, b){
				if (name){
					var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
					if (nameA < nameB) //sort string ascending
						return -1 
					if (nameA > nameB)
						return 1
					return 0 
				}
			})
			console.log("project Manager",this.projectMngr);
		},err=>{
			console.log("Couldn't get all developers ",err);
		})
	}

	getAllDevelopersNotInProject(id){
		this._projectService.getUsersNotInProject(id).subscribe((res:any)=>{
			this.availableDevelopers = res;
			console.log("hfghfjgh===============",this.availableDevelopers);
			this.dteam = [];
			_.forEach(this.availableDevelopers,(project)=>{
				if(project.userRole == "user" || project.userRole == "developer" ){
					this.dteam.push(project);
				}
			})
			console.log("dteam=-=-=-=-",this.dteam);
		},err=>{
			console.log(err);
		})
	}

	getAllProjectManagerNotInProject(id){
		this._projectService.getAllProjectManagerNotInProject(id).subscribe((res:any)=>{
			console.log("projectManagerNotIn project",res);
			this.availableProjectMngr = res;
		},err=>{
			console.log(err);
		})
	}

	getProjects(){
		this._projectService.getProjects().subscribe((res:any)=>{
			console.log("res of all projects in edit project component ====>" , res);
			this.projects = res;
		},(err:any)=>{
			console.log("err in all projects in edit project component ====>" , err);
		})
	}


	getProject(projectId){
		this._projectService.getProjectById(this.projectId).subscribe((res:any)=>{
			console.log("res of requested project in edit project component ====>" , res);
			this.loader = false;
			Swal.fire({type: 'success',title: 'Project found Successfully',showConfirmButton:false,timer: 2000})
			this.availData = res;
			localStorage.setItem("teams" , JSON.stringify(this.availData));
			// this.teams = true;
			console.log("this . avail Data in edit projects ======>" , this.availData);
			localStorage.setItem('editAvail' , JSON.stringify(true));
			this.editAvail = true;
		},(err:any)=>{
			Swal.fire('Oops...', 'Something went wrong!', 'error')

			console.log("err in requested project in edit project component ====>" , err);
		})

	}

	getProjectById(id){
		this.loader = false;
		console.log("id--=-=-=-{}{}{}",id);
		this._projectService.getProjectById(id).subscribe(res=>{
			this.availData = res;
			this.availData['add'] = [];
			this.availData['delete'] = [];
			console.log("this.availData ================+>" ,  this.availData );
			this.loader = false;
			console.log("this . avail data ==========>" ,this.availData.avatar);
			this.projectTeam = this.availData.Teams; 
			this.projectMngrTeam = this.availData.pmanagerId;
			console.log("project manager name",this.projectMngrTeam);
			localStorage.setItem('pmanagerteams', JSON.stringify(this.projectMngrTeam)); 
			localStorage.setItem('teams', JSON.stringify(this.projectTeam));
		},err=>{
			console.log(err);
			this.loader = false;
		})

	}
	get f() { return this.updateForm.controls; }

	updateProject(updateForm){
		this.submitted = true;
		if (this.updateForm.invalid) {
			return;
		}
		this.isDisable = true;
		console.log("update details of project",this.files,updateForm);
		console.log(updateForm.deadline);
		var newTeams = [];
		_.forEach(this.availData.Teams, t => { newTeams.push(t._id) });
		console.log("Update Team============>",newTeams);
		updateForm.pmanagerId = [];
		_.forEach(this.availData.pmanagerId, t => { updateForm.pmanagerId.push(t._id) });
		updateForm.delete = [];
		_.forEach(this.availData.delete, t => { updateForm.delete.push(t._id) });
		updateForm.add = [];
		_.forEach(this.availData.add, t => {updateForm.add.push(t._id) });
		updateForm.uniqueId = this.availData.uniqueId;
		updateForm.avatar = this.availData.avatar;
		updateForm._id = this.availData._id;
		updateForm.deadline = this.availData.deadline;
		// updateForm.controls.deadline = this.updateForm.controls.deadline
		// console.log("project manager iddddd",updateForm.controls.deadline);


		updateForm.deadline = $("#date-picker").val();
		

		var data = new FormData();
		data.append('title', updateForm.title);
		data.append('desc', updateForm.desc);
		data.append('uniqueId', updateForm.uniqueId);
		data.append('deadline', updateForm.deadline);
		console.log(updateForm.deadline)
		_.forEach(this.availData.pmanagerId, t => { data.append('pmanagerId', t._id) });
		_.forEach(this.availData.Teams, t => { data.append('Teams', t._id) });
		_.forEach(updateForm.delete, t => { data.append('delete', t) });
		_.forEach(updateForm.add, t => { data.append('add', t) });
		if(this.files && this.files.length>0){
			data.append('avatar', this.files[0]);  
		}
		console.log("updateForm={}{}{}{}{}",updateForm);
		console.log("avail data in update form ====>" , this.availData);
		this._projectService.updateProject(updateForm._id,data).subscribe((res:any)=>{
			this.loader = false;


			setTimeout(()=>{
				// window.location.reload();
				this.updateForm.get('Teams') .reset( );
			},500);

			this.getAllDevelopersNotInProject(this.ProjectId);


			console.log("response of update form  ====>" , res);

			Swal.fire({type: 'success',title: 'Project Updated Successfully',showConfirmButton:false, timer:3000})
			this.getProjectById(res._id);
			this.url = '';
			this.isDisable = false;

		},(err:any)=>{
			console.log("error of update form  ====>" , err);
			Swal.fire('Oops...', 'Something went wrong!', 'error')
			this.isDisable = false;
		})

	}
	deleteProject(projectId){
		console.log("pId::::::::::::>",projectId);
		if(projectId.BugId.length>0 || projectId.IssueId.length>0 || projectId.taskId.length>0 || projectId.Teams.length>0){
			Swal.fire({
				title: 'You can not delete this project!',
				html: "Number of team-members : <strong style="+'font-weight:bold'+">"+projectId.Teams.length  + 
				"</strong><br> Total number of tasks : <strong style="+'font-weight:bold'+">"+projectId.tasks.length  + 
				"</strong> <br> <strong style="+'font-weight:bold'+">Are you sure to delete? </strong> ",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes,Delete it!',
				showCloseButton: true
			}).then((result) => {
				if (result.value) {
					var body;
					console.log("reeeeeeee",projectId);
					console.log("bodyy ========>" , body);
					console.log("id===========>",projectId._id);
					this._projectService.deleteProjectById(projectId._id).subscribe((res:any)=>{
						console.log("Delete project======>" , res);
						$("#projects,#item_list,#visit_team_members").addClass('disabled');
						this.projects = res;
						Swal.fire({type: 'success',title: 'Project deleted Successfully',showConfirmButton:false,timer: 2000})
						this.router.navigate(['./view-projects']);
					},(err:any)=>{
						console.log("error in delete project =====>" , err);
						Swal.fire('Oops...', 'Something went wrong!', 'error')
					});
				}
			})
		}else{
			this._projectService.deleteProjectById(projectId._id).subscribe((res:any)=>{
				console.log("Delete project======>" , res);
				this.projects = res;
				Swal.fire({type: 'success',title: 'Project deleted Successfully',showConfirmButton:false,timer: 2000})
				this.router.navigate(['./view-projects']);
			},(err:any)=>{
				console.log("error in delete project =====>" , err);
				Swal.fire('Oops...', 'Something went wrong!', 'error')
			})
		}
	}

	addDeveloper(event){

		console.log(event);
		this.projectTeam.push(event);
		this.availData.add.push(event);
	}
	removeDeveloper(event){
		console.log(event);
		var id;
		console.log(event);
		Swal.fire({
			html: "<span style="+'font-size:25px'+">  Are you sure you want to remove <strong style="+'font-weight:bold'+">" + " " + event.name + " </strong> " + " from  <strong style="+'font-weight:bold'+">" + " "+ this.availData.title + "</strong> ? </span>",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes,Delete it!',
			showCloseButton: true
		}).then((result) => {
			console.log(result);
			if (result.value) {
				var body;
				this.projectTeam.splice(_.findIndex(this.projectTeam, event), 1);
				// Swal.fire({type: 'success',title: 'Deleted Successfully',showConfirmButton:false,timer: 2000})
				if(_.findIndex(this.dteam, function(o) { return o._id == event._id; }) == -1 ){
					this.availData.delete.push(event);
					this.availableDevelopers.push(event);
					this.getAllDevelopersNotInProject(this.ProjectId);

				}
			}

		})
	}

	addProjectManager(event){
		console.log(event);
		this.projectMngrTeam.push(event);

	}

	removeProjectManager(event){
		console.log(event);
		var id;
		console.log(event);
		Swal.fire({
			html: "<span style="+'font-size:25px'+">  Are you sure you want to remove <strong style="+'font-weight:bold'+">" + " " + event.name + " </strong> " + " from  <strong style="+'font-weight:bold'+">" + " "+ this.availData.title + "</strong> ? </span>",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes,Delete it!',
			showCloseButton: true
		}).then((result) => {
			if (result.value) {
				var body;
				this.projectMngrTeam.splice(_.findIndex(this.projectMngrTeam, event), 1);
				Swal.fire({type: 'success',title: 'Deleted Successfully',showConfirmButton:false,timer: 2000})
				if(_.findIndex(this.availableProjectMngr, function(o) { return o._id == event._id; }) == -1 ){
					console.log("in fi");
					this.availableProjectMngr.push(event);
					this.availData.delete.push(event);
				}

			}

		})
	}

	clearManagerSelection(event){
		console.log(this.availData);
		this.projectMngrTeam = JSON.parse(localStorage.getItem('pmanagerteams'));
	}

	clearSelection(event){
		console.log(this.availData);
		window.location.reload();
		this.projectTeam = JSON.parse(localStorage.getItem('teams')); 
	}
	openmodal(){

		$('#basicExampleModal').modal('show');
	}


	addIcon(value){
		this.updateForm.value['avatar'] = value;
		console.log(this.updateForm.value['avatar']);
		this.url = this.basMediaUrl+this.updateForm.value['avatar'];
		console.log(this.url);
		// $('#basicExampleModal').modal('hide');
	}

	onSelectFile1(event) {
		console.log(event);
		this.files = event;
	}

	onSelectFile(event) {
		console.log("response from changefile",event.target.files);
		this.files = event.target.files;
		$('#basicExampleModal').modal('hide');
		if (event.target.files && event.target.files[0]) {
			var reader = new FileReader();
			reader.readAsDataURL(event.target.files[0]); // read file as data url
			reader.onload = (event:any) => { // called once readAsDataURL is completed
				this.url = event.target.result;
			}
		}
	}
	removeAvatar(){
		this.url = "";
		if(this.files && this.files.length)
			this.files = null;
	}
}