import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { ViewProjectComponent } from './view-project/view-project.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { AddTeamComponent } from './add-team/add-team.component';
import { MainTableViewComponent } from './main-table-view/main-table-view.component';
import { IssueComponent } from "./issue/issue.component";
import { ProjectDetailComponent } from "./project-detail/project-detail.component";
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
// import { LogsComponent } from './logs/logs.component';
import { FileListComponent } from './file-list/file-list.component';
import {AddEmployeeComponent} from './add-employee/add-employee.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import {AddNoticeComponent} from './add-notice/add-notice.component';
import {NoticeboardComponent} from './noticeboard/noticeboard.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import {LeaveComponent} from './leave/leave.component';
import { AllDeveloperComponent} from './all-developer/all-developer.component';
import { VisitUserProfileComponent } from './visit-user-profile/visit-user-profile.component';
import {AllLeaveAppComponent} from './all-leave-app/all-leave-app.component';
import { AllEmployeeComponent } from './all-employee/all-employee.component';
import {SummaryComponent} from './summary/summary.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { UserSummaryComponent} from './user-summary/user-summary.component';
import { ForgotpwdComponent } from './forgotpwd/forgotpwd.component';
import { MyleaveComponent } from './myleave/myleave.component';
import { NotificationComponent } from './notification/notification.component';
import {BacklogComponent} from './backlog/backlog.component';
import { AttendenceComponent } from './attendence/attendence.component';
import { TimeLogComponent } from './time-log/time-log.component';
import { FileUploadDndComponent } from './file-upload-dnd/file-upload-dnd.component';






const routes: Routes = [
// {
	// 	path:'',
	// 	redirectTo:'login',
	// 	pathMatch:'full'
	// },
	{
		path:'login',
		component:LoginComponent
	},
	{
		path:'register',
		component:RegisterComponent
	},
	{
		path:'forgotpwd/:token',
		component:ForgotpwdComponent
	},

	{
		path:"",
		component:HomeComponent,
		canActivate: [AuthGuard],
		children:[
		{
			path:'',
			pathMatch:"full",
			redirectTo:'view-projects'
		},
		{
			path:'noticeboard',
			component:NoticeboardComponent
		},
		{
			path:'backlog/:id',
			component:BacklogComponent
		},
		{
			path:'myleave',
			component:MyleaveComponent
		},
		{
			path:'add-notice',
			component:AddNoticeComponent
		},
		{
			path:'view-projects',
			component:ViewProjectComponent
		},
		{
			path:'create-project',
			component:CreateProjectComponent
		},
		{
			path:'edit-project/:id',
			component:EditProjectComponent
		},
		{
			path:'add-team',
			component:AddTeamComponent
		},

		{
			path:'all-item-list',
			component:MainTableViewComponent
		},
		{
			path:'issue',
			component:IssueComponent
		},
		{
			path:'project-details/:id',
			component:ProjectDetailComponent
		},
		{
			path:'project-detail',
			component:ProjectDetailComponent
		},
		{
			path:'project/files-list/:id',
			component:FileListComponent
		},
		{
			path:'project-team/:id',
			component:AllDeveloperComponent
		},
		// {
		// 	path:'logs',
		// 	pathMatch: "full",
		// 	component: LogsComponent	
		// },
		// {
		// 	path:"logs/:projectId",
		// 	pathMatch: "full",
		// 	component: LogsComponent
		// },
		{
			path:'add-employee',
			component:AddEmployeeComponent
			
		},
		// {
		// 	path:"logs/:projectId/:memberId",
		// 	pathMatch: "full",
		// 	component: LogsComponent
		// },
		{
			path:'reset-password',
			//pathMatch: "full",
			component:ResetPasswordComponent
		},
		
		{
			path:'leave',
			component:LeaveComponent
		},
		{
			path:'visit-user-profile/:id',
			pathMatch: "full",
			component:VisitUserProfileComponent
		},
		{
			path:'all-leave-app',
			//pathMatch: "full",
			component:AllLeaveAppComponent
		},
		
		{
			path:'userprofile',
			pathMatch: "full",
			component:UserprofileComponent
		},
		{
			path:'all-employee',
			component:AllEmployeeComponent
		},
		{
			path:'summary/:id',
			component:SummaryComponent
		},
		{
			path:'editprofile/:id',
			pathMatch: "full",
			component:EditprofileComponent
		},
		{
			path:'user-summary/:userId/:projectId',
			pathMatch: "full",
			component:UserSummaryComponent
		},
		{
			path:'notification',
			component:NotificationComponent
		},
		{
			path:'attendence',
			component:AttendenceComponent
		},
		{
			path:'time-log/:id',
			component:TimeLogComponent
		}
		]

	}];

	@NgModule({
		imports: [RouterModule.forRoot(routes, { useHash : true })],
		exports: [RouterModule]
	})
	export class AppRoutingModule { }
