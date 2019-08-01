import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { config } from '../config';
import { of, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    @Output() ProfilePicture = new EventEmitter();

    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    login(userCredentials) {
        console.log("heyy");
        return this.http.post<any>(config.baseApiUrl + "user/login", userCredentials)
            .pipe(map(user => {
                console.log("login user=========>", user);
                // login successful if there's a jwt token in the response
                if (user && user.data && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user.data));
                    localStorage.setItem('token', JSON.stringify(user.token));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    register(user) {
        return this.http.post(config.baseApiUrl + "user/signup", user);
    }
    resetPassword(user) {
        return this.http.put(config.baseApiUrl + "user/reset-password", user);
    }

    getUserById(id) {
        var id = id;
        console.log("id{}{}{}{}", id);
        return this.http.get(config.baseApiUrl + "user/get-user-by-id/" + id);
        console.log("user id is==========>", id);
    }

    changeProfilePicture(files: any, data) {

        console.log("file is=================>", files);
        console.log("data is ============>", data);
        let formdata = new FormData();
        formdata.append("userId", data);
        formdata.append("profilePhoto", files[0]);
        console.log("file is===>>>", files[0]);

        return this.http.put(config.baseApiUrl + "user/change-profile/" + data, formdata)
            .pipe(
                map(res => {
                    console.log("res==========", res);
                    this.ProfilePicture.emit('ProfilePicture');
                    console.log("profile============picture======", this.ProfilePicture);
                    return res;
                })
            )
    }

    addUser_with_file(body, files: any) {
        console.log("fhvg=>", files);
        console.log("bodyyyyyyyyy===>", body);
        let formdata = new FormData();
        formdata.append('name', body.name);
        // formdata.append('lname',body.lname);
        formdata.append('email', body.email);
        formdata.append('userRole', body.userRole);
        formdata.append('password', body.password);
        formdata.append('joiningDate', body.date);
        formdata.append('phone', body.phone);
        formdata.append('isDelete', body.isDelete);
        formdata.append('experience', body.experience);
        // formdata.append('profilePhoto',files[0]);
        // formdata.append("profilePhoto",files[1]);
        if (files.length) {
            for (var i = 0; i < files.length; i++) {
                formdata.append("profilePhoto", files[i]);
            }
        }
        console.log("body===>>>", body);


        return this.http.post(config.baseApiUrl + "user/signup", formdata);

    }


    editUserProfileWithFile(data, id) {
        // var id = JSON.parse(localStorage.getItem('currentUser'))._id;
        return this.http.put(config.baseApiUrl + "user/update-details/" + id, data);
    }



    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    resetPwd(user) {
        // console.log("res-=-=",user);
        return this.http.put(config.baseApiUrl + "user/forgot-password", user);
    }

    updatepwd(user) {
        return this.http.put(config.baseApiUrl + "user/update-password", user);
    }
}



