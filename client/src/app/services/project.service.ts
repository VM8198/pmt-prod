import { Injectable } from '@angular/core';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../config';
import * as _ from 'lodash';
import { Observable, of, pipe } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ProjectService {

	@Output() Updateproject = new EventEmitter();
	@Output() Deleteproject = new EventEmitter();
	@Output() UpdateDeveloper = new EventEmitter();
	@Output() AddTask = new EventEmitter();


	constructor(private http: HttpClient) { }

	getAllStatus() {
		return config.statuslist;
	}

	getAllProtity() {
		return config.priorityList;
	}

	getProjects() {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "project/all");
	}

	getAllDevelopers() {

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "user/get-all-developers");
	}


	getAllProjectMngr() {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "user/get-all-project-manager");
	}
	getAllTeamOfManagerId(id) {
		console.log("manager id", id);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		var userId = JSON.parse(localStorage.getItem('currentUser'))._id;
		console.log("user ID ====>", userId);
		return this.http.get(config.baseApiUrl + "project/projectByManagerId/" + id);
	}


	getProjectById(id) {
		console.log("project Id ====>", id);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "project/get-project-by-id/" + id);
	}

	getDeveloperOfProject(id) {
		console.log("project ID ====>", id);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		var userId = JSON.parse(localStorage.getItem('currentUser'))._id;
		console.log("user ID ====>", userId);
		return this.http.get(config.baseApiUrl + "project/get-developer-of-project" + id);
	}
	leavesById(email) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		// var email = JSON.parse(localStorage.getItem('currentUser')).email;
		return this.http.post(config.baseApiUrl + "leave/leavesByEmail", email);
	}


	addProject(body) {
		console.log("body====>>", body);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl + "project/add-project", body).pipe(map(res => {
			console.log('response of project==========', res);
			this.Updateproject.emit('Updateproject');
			console.log("Updateproject==========={}{}{}", this.Updateproject);
		}))

	}

	addData(data, subUrl) {
		console.log(data);
		// data['operatorId'] = JSON.parse(localStorage.getItem('currentUser'))._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl + subUrl, data);
	}

	updateData(data, subUrl) {
		console.log("data ====>", data);
		// data['operatorId'] = JSON.parse(localStorage.getItem('currentUser'))._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl + subUrl + data._id, data);
	}

	updateStatus(data) {
		data['operatorId'] = JSON.parse(localStorage.getItem('currentUser'))._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl + "tasks/update-task-status-by-id", data);
	}

	completeItem(data) {
		data['operatorId'] = JSON.parse(localStorage.getItem('currentUser'))._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl + "tasks/update-task-status-complete", data);
	}


	getlogs(memberId) {
		console.log("memberID =========>", memberId);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "user/get-logs/" + memberId);
	}

	getAllDevelopersByProjectManager() {
		var body = {
			"pmId": JSON.parse(localStorage.getItem('currentUser'))._id
		}
		console.log("projectManagerId ==>", body);
		return this.http.post(config.baseApiUrl + "user/get-all-developers-by-project-manager", body);
	}
	uploadFiles(formData) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl + "project/upload-file", formData);
	}
	getLogs(developerId) {
		console.log("developer ID in project service ===> ", developerId);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl + "user/get-logs/" + developerId);
	}
	getAllFilesInfolder(id) {
		var obj = { projectId: id };
		return this.http.post(config.baseApiUrl + "project/get-all-files", obj);
	}

	deleteSelectedFile(data) {
		return this.http.post(config.baseApiUrl + "project/delete-file", data);
	}

	updateProject(projectId, data) {
		console.log("updated Data in project servie", data);
		// console.log("updated File in project servie" , file);
		// var projectId = data._id;
		// var projectId = projectId._id;
		console.log("projectId ======>", projectId);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl + "project/update/" + projectId, data)
			.pipe
			(
				map(res => {
					console.log("res======", res);
					this.UpdateDeveloper.emit('UpdateDeveloper');
					return res;
				}

				)
			);
	}
	getProjectByIdAndUserId(id) {
		console.log("id is==========>", id);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		var userId = JSON.parse(localStorage.getItem('currentUser'))._id;
		console.log("user ID ====>", userId);
		return this.http.get(config.baseApiUrl + "project/get-project-by-id-and-by-userid/" + id + "/" + userId);
	}

	addNotice(data) {
		console.log(data);
		return this.http.post(config.baseApiUrl + "notice/add-notice", data);
	}

	getNotice() {
		return this.http.get(config.baseApiUrl + "notice/allnotice");
	}

	getNoticeById(noticeid) {
		return this.http.get(config.baseApiUrl + "notice/noticebyid/" + noticeid);
	}

	deleteProjectById(data) {
		var is;
		// var projectId = data;
		// const httpOptions = {
		// 	headers: new HttpHeaders({
		// 		'Content-Type':  'application/json',
		// 		'x-access-token':  JSON.parse(localStorage.getItem('token'))
		// 	})
		// };
		return this.http.put(config.baseApiUrl + "project/delete/" + data, is).pipe(map(res => {
			console.log('response of project==========', res);
			this.Deleteproject.emit('Deleteproject');
			console.log("Deleteproject==========={}{}{}", this.Deleteproject);
		}))
	}

	getAllTasks() {
		return this.http.get(config.baseApiUrl + "tasks/all-task");
	}

	updateTask(id, task) {
		console.log("task =========>", task);
		return this.http.put(config.baseApiUrl + "tasks/update-task-by-id/" + id, task);
	}

	updateNoticeWithFile(data, id) {
		return this.http.put(config.baseApiUrl + "notice/update-notice-by-id/" + id, data);
	}

	changeNoticePicture(files: any, data) {
		console.log("file is=================>", files);
		console.log("data is ============>", data);
		let formdata = new FormData();
		formdata.append("noticeid", data);
		formdata.append("profilePhoto", files[0]);
		console.log("file is===>>>", files[0]);
		return this.http.put(config.baseApiUrl + "notice/change-photo/" + data, formdata);
	}

	deleteNotice(id) {
		console.log("notice data in service==>>", id);
		return this.http.delete(config.baseApiUrl + "notice/delete-notice-by-id/" + id);
	}

	addTask(data) {
		console.log("hiiiiiiiiiii", data);
		console.log(data);

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl + "tasks/add-task", data)
			.pipe(map(res => {
				console.log("response of add task==========", res);
				this.AddTask.emit('AddTask');
				return res;
			})
			);
	}
	getTaskById(id) {

		console.log("task by id in child ==>", id);

		var id = id;

		console.log("idddd=====>", id);
		return this.http.get(config.baseApiUrl + "tasks/get-task-by-id/" + id);

	}

	getTeamByProjectId(id) {
		var projectId = id;
		return this.http.get(config.baseApiUrl + "project/get-developer-of-project/" + id);
	}

	addUser_with_file(body, files: any) {
		console.log("fhvg=>", files);
		console.log("bodyyyyyyyyy===>", body);
		let formdata = new FormData();
		formdata.append('fname', body.fname);
		formdata.append('lname', body.lname);
		formdata.append('email', body.email);
		formdata.append('userRole', body.userRole);
		formdata.append('password', body.password);
		formdata.append('joiningDate', body.date);
		formdata.append('phone', body.mobile);
		formdata.append('experience', body.experience);
		formdata.append('profilePhoto', files[0]);
		formdata.append("profilePhoto", files[1]);
		console.log("body===>>>", body);
		return this.http.post(config.baseApiUrl + "user/signup", formdata);
	}
	addProject_Without_file(body) {
		console.log("addproject2 is calling");
		console.log("body====>>", body);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl + "user/signup_without_file", body);

	}
	deleteTaskById(data) {
		console.log("data of taskkkkkkkkkkkkkkkkkkkssssssssssss", data);
		var taskId = data._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.delete(config.baseApiUrl + "tasks/delete-task-by-id/" + taskId);
	}
	uploadFilesToFolder(data, file: FileList) {
		console.log(data);
		let formData = new FormData();
		formData.append("userId", data);
		formData.append("uploadFile", file[0]);
		return this.http.post(config.baseApiUrl + "project/upload-file", formData);
	}
	//update employee profile (allemployee.component.ts) -adminSide
	updateUserById(data) {
		var id = data._id;
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'x-access-token': JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl + "user/update-details/" + id, data);
	}

	getUsersNotInProject(id) {
		return this.http.get(config.baseApiUrl + "user/get-user-not-in-project-team/" + id);
	}

	getAllProjectManagerNotInProject(id) {
		return this.http.get(config.baseApiUrl + "user/get-project-mngr-not-in-project-team/" + id);
	}

	deleteEmployeeById(userId) {
		var is;
		console.log("devloperId{}{}{}-===", userId);
		return this.http.put(config.baseApiUrl + "user/delete-user/" + userId, is);
	}

	// changeNoticePicture(files: any, data){
	// 	console.log("file is=================>",files);
	// 	console.log("data is ============>",data);
	// 	let formdata = new FormData();
	// 	formdata.append("noticeid",data);
	// 	formdata.append("profilePhoto",files[0]);
	// 	console.log("file is===>>>",files[0]);
	// 	return this.http.put(config.baseApiUrl+"notice/change-photo/"+data,formdata);
	// }

	addSprint(data) {
		console.log("data in service===>>>", data);
		return this.http.post(config.baseApiUrl + "sprint/add-sprint", data);

	}

	getSprint(projectId) {
		console.log("data in service===>>>", projectId);
		return this.http.get(config.baseApiUrl + "sprint/sprint-by-projects/" + projectId);
	}

	sprintById(sprintId) {
		console.log("data in service===>>>", sprintId);
		return this.http.get(config.baseApiUrl + "sprint/sprint-by-sprint-id/" + sprintId);

	}
	updateSprint(sprint) {
		console.log("sprint in service", sprint);
		var sprintId = sprint._id;
		return this.http.put(config.baseApiUrl + "sprint/update-sprint-by-id/" + sprintId, sprint);
	}

	completeSprint(sprintId) {
		console.log("sprint In service", sprintId);
		return this.http.get(config.baseApiUrl + "sprint/sprint-complete/" + sprintId);
	}
	startSprint(sprintdata) {
		console.log("sprintData in service", sprintdata);
		return this.http.put(config.baseApiUrl + "sprint/start-sprint", sprintdata);
	}

	getProjectByPmanagerId(pmanagerId) {
		console.log("pmanagerId=====>", pmanagerId);
		return this.http.get(config.baseApiUrl + "project/get-project-by-pmanagerId/" + pmanagerId);


	}

	addNotification(body) {
		console.log("body in service", body);
		let formdata = new FormData();
		formdata.append('pmanagerName', body.pmanagerName);
		formdata.append('projectId', body.projectId);
		formdata.append('subject', body.subject);
		formdata.append('content', body.content);
		formdata.append('sendTo', body.sendTo);
		return this.http.post(config.baseApiUrl + "sendNotification/addNotification", formdata);

	}
	getNotificationByUserId(currentUserId) {
		return this.http.get(config.baseApiUrl + "sendNotification/get-notification-By-Id/" + currentUserId)
	}

	getUnreadNotification(currentUserId) {
		return this.http.get(config.baseApiUrl + "sendNotification/get-unread-notification/" + currentUserId)
	}

	deleteSprint(sprintId) {
		console.log("sprint in service", sprintId);
		return this.http.delete(config.baseApiUrl + "sprint/delete-sprint-by-id/" + sprintId);
	}

	addTimeLog(data) {
		console.log('data=====++++++>', data);
		return this.http.post(config.baseApiUrl + "timeLog/timeLog", data);
	}

	changeAvatar(files: any, data) {
		console.log("file is=================>", files);
		console.log("data is ============>", data);
		let formdata = new FormData();
		formdata.append("projectId", data);
		formdata.append("avatar", files[0]);
		console.log("file is===>>>", files[0]);
		return this.http.put(config.baseApiUrl + "project/change-avatar/" + data, formdata);
	}


}



