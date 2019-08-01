import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AlertService } from '../services/alert.service';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { config } from '../config';
declare var $ : any;
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';
import {SearchTaskPipe} from '../search-task.pipe';
import * as _ from 'lodash';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
	selector: 'app-all-employee',
	templateUrl: './all-employee.component.html',
	styleUrls: ['./all-employee.component.css']
})
export class AllEmployeeComponent implements OnInit {
	searchFlag = false; 
	filteredTeams;
	filteredDevelopers;
	tracks:any;
	Teams;
	tasks;
	developers;
	// developer;
	userId;
	filter;
	projectId;
	searchText;
	mergeArr = [];
	finalArray = [];
	loader:boolean=false;
	path = config.baseMediaUrl;
	addEmployeeForm;
	files: Array<File> = [];
	selectedProjectId: 'all';
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	projects;
	
	
	constructor(private formBuilder: FormBuilder, private _loginService: LoginService,private route: ActivatedRoute,public _alertService: AlertService,
		private router: Router, public _projectService: ProjectService,  public searchTextFilter: SearchTaskPipe) { }

	ngOnInit() {

		// this.mergeArr = this.developers.concat(this.Teams);
		this.getAllDevelopers();
		this.getAllProjects();
		// this.getDeveloper(projectId);
		this.loader=true;
		this.searchFlag = false;
		$('.datepicker').pickadate();
		// this.getAllUser();
	}
	addFile(event){
		this.files.push(event.target.files[0]);
	}
	getInitialsOfName(name){
		if(name != 'admin'){
			var str = name.split(' ')[0][0]+name.split(' ')[1][0];
			return str.toUpperCase();
		}else if(name == 'admin'){
			return "A";
		}else{
			return "";
		}
	}
	getAllDevelopers(){
		console.log("hiiiiiiiiii");
		this._projectService.getAllDevelopers().subscribe(res=>{
			this.developers = res;
			this.filteredDevelopers = res;
			console.log("dev()()",this.developers);
			
			// this.addEmployeeForm = res;
			this.developers.sort(function(a, b){
				if (a.name && b.name) {
					var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
					if (nameA < nameB) //sort string ascending
						return -1 
					if (nameA > nameB)
						return 1
					return 0 //default return value (no sorting)
				}
			})
			console.log("Developers",this.developers);
		},err=>{
			console.log("Couldn't get all developers ",err);
			this._alertService.error(err);
		})
		setTimeout(()=>{
			console.log("rotate js--------------------")
			$('a.rotate-btn').click(function () {
				$(this).parents(".card-rotating").toggleClass('flipped');
			});
		},2000);
	}
	deleteEmployee(developerid){

			console.log("msgggg--=--",developerid);
			Swal.fire({
					html: "<span style="+'font-size:25px'+">  Are you sure you want to remove <strong style="+'font-weight:bold'+">" + " " + developerid.name + " </strong> ",
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes,Delete it!',
					showCloseButton: true
				}).then((result) => {
						if (result.value) {
								var body;
								this._projectService.deleteEmployeeById(developerid._id).subscribe(res=>{
										console.log("response of remove developer", res);
										Swal.fire({type: 'success',title: 'Employee remove Successfully',showConfirmButton:false,timer: 2000})
										this.getAllDevelopers();
									},err=>{
											console.log("errr=-=-=-= ",err);
											Swal.fire('Oops...', 'Something went wrong!', 'error')
										})
									}
								})
							}
							getAllProjects(){
								this._projectService.getProjects().subscribe(res=>{
									this.projects = res;
								},err=>{
									this._alertService.error(err);
									console.log(err);
								})
							}
							getDeveloper(projectId){
								this.selectedProjectId = projectId;
								console.log(" project id is===========>",projectId);
								console.log(" developer of projerct===========>",this.developers);
								if (projectId !='all') {
									this.developers =[];
									console.log(this.developers);
									this._projectService.getTeamByProjectId(projectId).subscribe((res:any)=>{
										this.Teams = res.Teams;
										console.log("response of developer============>"  ,this.Teams);
										_.forEach(this.Teams, (content)=>{
											this.developers.push(content);
											console.log(this.developers);

				});
				this.filteredTeams = this.developers;
				setTimeout(()=>{
					console.log("rotate js--------------------")
					$('a.rotate-btn').click(function () {
						$(this).parents(".card-rotating").toggleClass('flipped');
					});
				},2000);
			})
			this.searchFlag = true;
		} else{
			this.getAllDevelopers();
		}
	}	
	onKey(searchText){
		console.log("searchText",searchText);
		if(this.searchFlag == true){
			var dataToBeFiltered = [this.filteredTeams];
		}
		else{
			var dataToBeFiltered = [this.filteredDevelopers];
		}
		var developer = this.searchTextFilter.transform1(dataToBeFiltered, searchText);
		console.log("developer =======>", developer);
		this.developers = [];
		if(this.selectedProjectId !='all'){
			_.forEach(developer, (content)=>{
				this.developers.push(content);
			});
		}
		else {
			_.forEach(developer, (content)=>{
				this.developers.push(content);
			});
		}

	}
}






