import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../config';
import * as _ from 'lodash';


@Injectable({
	providedIn: 'root'
})
export class CommentService {

	constructor(private http:HttpClient) { }

	getAllComments(taskId){
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'x-access-token':  JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl+"comment/all/"+taskId);
	}

	getsingleComment(commentId){
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'x-access-token':  JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(config.baseApiUrl+"comment/single-comment/"+commentId);
	}

	addComment(data){
		console.log(data);
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'x-access-token':  JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(config.baseApiUrl+"comment/add-comment/", data);
	}

	updateComment(data){
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'x-access-token':  JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.put(config.baseApiUrl+"comment/edit-comment/", data);
	}

	deleteComment(commentId){
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'x-access-token':  JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.delete(config.baseApiUrl+"comment/edit-comment/"+commentId);
	}
}
