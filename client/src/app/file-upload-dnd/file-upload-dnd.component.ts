import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
declare var $ : any;
import * as _ from 'lodash';
import { NoticeboardComponent } from '../noticeboard/noticeboard.component';
@Component({
	selector: 'app-file-upload-dnd',
	templateUrl: './file-upload-dnd.component.html',
	styleUrls: ['./file-upload-dnd.component.css']
})

export class FileUploadDndComponent implements OnInit {

	files = [];
	errors: Array<string> =[];
	dragAreaClass: string = 'hidden';
	dragAreaContent: string = 'Choose a file or drag it here';
	@Input() sectionId: number = 0;
	@Input() fileExt: string = "JPG, JPEG, PNG, PDF";
	@Input() maxFiles: number = 5;
	@Input() maxSize: number = 5; // 5MB
	@Output() uploadedFile = new EventEmitter();

	file = [];
	videos =[];
	currentInput;
	typeOfFile;
	constructor(public notice: NoticeboardComponent) {
		this.notice.noticeUpdate.subscribe(data=>{
			if(data == 'noticeUpdate'){
				this.files = [];
				this.videos = [];
			}
		})
	}

	ngOnInit() {
	}

	onFileChange(event){
		console.log(event);
		var fileList = [];
		for(var i = 0 ; i < event.target.files.length ; i++){
			this.currentInput = event.target.files[i].name;
			this.typeOfFile = event.target.files[i].type;
			console.log(this.currentInput);
			console.log(this.typeOfFile);
			fileList[i] = event.target.files[i];			
		}
		this.doProcess(fileList);
	}
	@HostListener('dragover', ['$event']) onDragOver(event) {
		this.dragAreaClass = "dragarea droparea";
		this.dragAreaContent = "Drop your file here.";
		event.preventDefault();
	}

	@HostListener('dragenter', ['$event']) onDragEnter(event) {
		this.dragAreaClass = "dragarea droparea";
		this.dragAreaContent = "Drop your file here.";
		event.preventDefault();
	}

	@HostListener('dragend', ['$event']) onDragEnd(event) {
		this.dragAreaClass = "hidden";
		this.dragAreaContent = "Choose a file or drag it here"
		event.preventDefault();
	}

	@HostListener('dragleave', ['$event']) onDragLeave(event) {
		this.dragAreaClass = "hidden";
		this.dragAreaContent = "Choose a file or drag it here"
		event.preventDefault();
	}

	@HostListener('drop', ['$event']) onDrop(event) {   
		this.dragAreaClass = "dragarea";
		this.dragAreaContent = "Choose a file or drag it here"
		event.preventDefault();
		event.stopPropagation();
		var fileList = [];
		for(var i = 0 ; i < event.dataTransfer.files.length ; i++){
			fileList[i] = event.dataTransfer.files[i];			
		}
		this.doProcess(fileList);
	}

	doProcess(files){
		if(this.files.length<=0){
			this.files = files;
		}else{
			for(var i=0; i<files.length; i++)
				this.files[this.files.length] = files[i];
		}
		console.log(this.files);
		console.log(this.files);



		this.file = [];
		this.videos = [];
		for (var i = 0; i < this.files.length; i++) {
			if (this.files[i].type == 'image/jpeg' || this.files[i].type == 'image/jpg' || this.files[i].type == 'image/png' ) {
				this.file.push(this.files[i]);
			} else if (this.files[i].type == 'application/pdf') {
				this.file.push(this.files[i]);
			} 
		}
		
		for (var i = 0; i < this.file.length; i++) {
			var reader: any,
			target: EventTarget;
			reader = new FileReader();

			var j = 0;
			reader.onload = function (e: any) {
				$('#blah_' + j).attr('src', e.target.result);
				j = j + 1;
			}
			reader.readAsDataURL(this.file[i]);
		}

		this.saveFiles(this.files);
	}

	saveFiles(files){
		this.errors = [];
		if (files.length > 0 && (!this.isValidFiles(files))) {
			this.uploadedFile.emit([]);
			return;
		}       
		if (files.length > 0) {
			this.uploadedFile.emit(files);
		}else{
			this.dragAreaClass = "hidden";
		}
	}

	private isValidFiles(files){
		if (files.length > this.maxFiles) {
			this.errors.push("Error: At a time you can upload only " + this.maxFiles + " files");
			this.files = [];
			return;
		}        
		this.isValidFileExtension(files);
		return this.errors.length === 0;
	}

	private isValidFileExtension(files){
		var extensions = (this.fileExt.split(','))
		.map(function (x) { return x.toLocaleUpperCase().trim() });
		for (var i = 0; i < files.length; i++) {
			var ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
			var exists = extensions.includes(ext);
			if (!exists) {
				this.errors.push("Error (Extension): " + files[i].name);
				this.files = [];
			}
			this.isValidFileSize(files[i]);
		}
	}
	private isValidFileSize(file) {
		var fileSizeinMB = file.size / (1024 * 1000);
		var size = Math.round(fileSizeinMB * 100) / 100;
		if (size > this.maxSize){
			this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
			this.files = [];
		}
	}
	deleteFile(file, index) {
		var x = _.indexOf(this.files, file);
		console.log(file);
		console.log(this.file[index], x);
		this.files.splice(x, 1)
		this.file.splice(index, 1);
		this.saveFiles(this.files);
	}
	deletePdfFile(file, index) {
		var y = _.indexOf(this.files, file);
		console.log(file);
		console.log(this.file[index], y);
		this.files.splice(y, 1)
		this.file.splice(index, 1);
		this.saveFiles(this.files);
	}
}
