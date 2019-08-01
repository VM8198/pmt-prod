import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	currentUser: any;

	constructor(private router: Router,
        private _loginService: LoginService) {
		this._loginService.currentUser.subscribe(x => this.currentUser = x);
	}

	ngOnInit() {
	}

	logout() {
		this._loginService.logout();
		this.router.navigate(['/login']);
	}

}
