import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { ToastrModule } from 'ngx-toastr';
//import { FlexLayoutModule } from "@angular/flex-layout";
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ViewProjectComponent } from './view-project/view-project.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { AddTeamComponent } from './add-team/add-team.component';
import { EditTeamComponent } from './edit-team/edit-team.component';
import { MainTableViewComponent } from './main-table-view/main-table-view.component';
import { HeaderComponent } from './header/header.component';
import { IssueComponent } from './issue/issue.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
// import {ChildComponent}  from './child/child.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
//import { MatIconModule } from "@angular/material/icon";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
// import { FileUploadDndComponent } from './file-upload-dnd/file-upload-dnd.component';

// import { LogsComponent } from './logs/logs.component';

import { FileListComponent } from './file-list/file-list.component';
//import { DndModule } from 'ngx-drag-drop';
import { NgxEditorModule } from 'ngx-editor';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TimeAgoPipe } from 'time-ago-pipe';
import { UpdateUserComponent } from './update-user/update-user.component';
import { AddNoticeComponent } from './add-notice/add-notice.component';
import { NoticeboardComponent } from './noticeboard/noticeboard.component';
import { SearchTaskPipe } from './search-task.pipe';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { ChildComponent } from './child/child.component';
import { LeaveComponent } from './leave/leave.component';
import { AllDeveloperComponent } from './all-developer/all-developer.component';
import { VisitUserProfileComponent } from './visit-user-profile/visit-user-profile.component';
import { AllLeaveAppComponent } from './all-leave-app/all-leave-app.component';
import { AllEmployeeComponent } from './all-employee/all-employee.component';
import { SummaryComponent } from './summary/summary.component';
import { PushNotificationService } from 'ngx-push-notifications';
import { ImageViewerModule } from 'ng2-image-viewer';

import { CommonModule } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { DemoUtilsModule } from './demo-utils/module';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule, MatNativeDateModule } from "@angular/material";
import { Ng2SearchPipeModule } from 'ng2-search-filter';






//All component for firebase notification
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { ProjectService } from './services/project.service';
import { MessagingService } from './services/messaging.service';
import { LoginService } from './services/login.service';
import { environment } from '../environments/environment';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { firebaseConfig } from './../environments/firebase.config';
import { EditprofileComponent } from './editprofile/editprofile.component'
import { SelectDropDownModule } from 'ngx-select-dropdown'
import { NgSelectModule } from '@ng-select/ng-select';
import { UserSummaryComponent } from './user-summary/user-summary.component';
import { ForgotpwdComponent } from './forgotpwd/forgotpwd.component';
import { MyleaveComponent } from './myleave/myleave.component';
import { NotificationComponent } from './notification/notification.component';
import { AttendenceComponent } from './attendence/attendence.component';
import { BacklogComponent } from './backlog/backlog.component';
import { TimeLogComponent } from './time-log/time-log.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadDndComponent } from './file-upload-dnd/file-upload-dnd.component';
import { from } from 'rxjs';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ViewProjectComponent,
        CreateProjectComponent,
        EditProjectComponent,
        AddTeamComponent,
        EditTeamComponent,
        MainTableViewComponent,
        HeaderComponent,
        IssueComponent,
        ProjectDetailComponent,
        HomeComponent,
        RegisterComponent,
        // LogsComponent,
        FileListComponent,
        TimeAgoPipe,
        UpdateUserComponent,
        SearchTaskPipe,
        ResetPasswordComponent,
        AddEmployeeComponent,
        ChildComponent,
        AddNoticeComponent,
        NoticeboardComponent,
        UserprofileComponent,
        LeaveComponent,
        AllDeveloperComponent,
        VisitUserProfileComponent,
        AllLeaveAppComponent,
        AllEmployeeComponent,
        SummaryComponent,
        EditprofileComponent,
        UserSummaryComponent,
        ForgotpwdComponent,
        MyleaveComponent,
        NotificationComponent,
        AttendenceComponent,
        BacklogComponent,
        TimeLogComponent,
        FileUploadDndComponent,

    ],

    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        FormsModule,
        HttpClientModule,
        NgbModule,

        DragDropModule,
        MatCardModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        NgxEditorModule,
        CKEditorModule,
        Ng2SearchPipeModule,
        // <----- this module will be deprecated in the future version.
        MatDatepickerModule,        // <----- import(must)
        MatNativeDateModule,        // <----- import for date formating(optional)

        DemoUtilsModule,
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase),
        SelectDropDownModule,
        NgSelectModule,
        ImageViewerModule,
        ToastrModule.forRoot(),
        CommonModule,

        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        // DemoUtilsModule

    ],
    providers: [LoginService, ProjectService, MessagingService, AsyncPipe, PushNotificationService, NoticeboardComponent],
    bootstrap: [AppComponent],

})
export class AppModule { }
