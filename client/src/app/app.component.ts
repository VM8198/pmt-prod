import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'project-manager';
	currentUser: any;
	constructor(public router: Router) {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		// var obj = JSON.parse(this.currentUser.replace(/ 0+(?![\. }])/g, ' '));
	}

	ngOnInit() {
		if (!this.currentUser) {
			// this.router.navigate(['/login'])
		}
		$("#dropdown").click(function (e) {
			e.stopPropagation();
		});

	}
}
