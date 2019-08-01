import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
@Component({
	selector: 'app-file-list',
	templateUrl: './file-list.component.html',
	styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
	projectId;
	files;
	loader:boolean=false;
	constructor(public _projectService: ProjectService, public route: ActivatedRoute) {
		this.route.params.subscribe(param=>{
			this.projectId = param.id;
		})
	}

	ngOnInit() {
		this.getAllFile(this.projectId);
	}

	getAllFile(id){
		this.loader=true;
		setTimeout(()=>{
		this._projectService.getAllFilesInfolder(id).subscribe(res=>{
			this.files = res;
			for(var i=0;i<this.files.length;i++){
				var newfile = "http://132.140.160.60/"+this.files[i].split('/')[4]+"/"+this.files[i].split('/')[5]+"/"+this.files[i].split('/')[6]+"/"+this.files[i].split('/')[7]+"/"+this.files[i].split('/')[8];
				this.files[i] = newfile;
			}
			console.log(this.files);
			this.loader=false;
		},err=>{
			console.log(err);
			this.loader=false
		})
		,3000});
	}

	onfileChange(files : FileList){
		console.log(files);
		let formData = new FormData();
		formData.append("projectId", this.projectId);
		formData.append("userName", JSON.parse(localStorage.getItem('currentUser')).name);
		for(var i = 0; i<files.length; i++){
			formData.append("fileUpload", files[i]);
		}
		this._projectService.uploadFiles(formData).subscribe(res=>{
			console.log(res);
			this.getAllFile(this.projectId);
		},err=>{
			console.log(err);
			this.getAllFile(this.projectId);
		})
	}

	deleteFile(file){
		console.log(file);
		var body = {file: file, projectId: this.projectId}
		this._projectService.deleteSelectedFile(body).subscribe((res:any)=>{
			console.log(res);
			this.getAllFile(this.projectId);
		},err=>{
			console.log(err);
			this.getAllFile(this.projectId);
		})
	}

}
