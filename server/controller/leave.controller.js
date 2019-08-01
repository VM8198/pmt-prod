var leaveModel = require ('../model/leave.model');
var tasksModel = require('../model/tasks.model');
var userModel = require('../model/user.model');
var projectModel = require('../model/project.model');
var notificationModel = require('../model/notification.model'); 
var sendnotificationModel = require('../model/sendNotification.model');
var nodemailer = require ('nodemailer');
const smtpTransport = require ('nodemailer-smtp-transport');
let leaveController = {};
var nodemailer = require('nodemailer');
var mkdir = require('mkdirp');
var path = require('path');
var fs = require('fs');
var dir = require('node-dir');
var _ = require('lodash');
var pushNotification = require('./../service/push-notification.service');
var mongoose = require('mongoose');
var maillist = [];
var mailContent = "";
var transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	service: 'gmail',

	auth: {
		user: 'raoinfotechp@gmail.com',
		pass: 'raoinfotech@123'
	}
});


leaveController.applyLeave = function(req,res){
	var leave = new leaveModel(req.body);
	var duration = leave.leaveDuration;
	leave.save(function(err,leave){
		console.log("leave===========>",leave);
		if(err) {
			return (res.status(500).send(err))
		}else{	
			var uploadPath = path.join(__dirname, "../uploads/"+leave._id+"/");
			req.file('attechment').upload({
				maxBytes: 50000000,
				dirname: uploadPath,
				saveAs: function (__newFileStream, next){
					dir.files(uploadPath, function(err,files){
						if (err){
							mkdir(uploadPath, 0775);
							return next(undefined, __newFileStream.filename);
						}else {
							return next(undefined, __newFileStream.filename);
						}
					});
				}
			}, function(err,files){
				if(err){
					console.log(err);
					return (res.status(500).send(err));
				}else{
					console.log(files);
					var fileNames = [];
					if (files.length>0){
						_.forEach(files, (gotFile)=>{
							fileNames.push(gotFile.fd.split('/uploads/').reverse()[0]);
						})
					}
					leave['attechment'] = fileNames;
					leaveModel.findOneAndUpdate({_id:leave._id}, {$set:{attechment:fileNames}},{upsert:true, new:true} )
					.exec((err,uploadFile)=>{
						if(err){
							console.log(err);
							return (res.status(500).send(err));
						}else{
							projectModel
							.find({Teams : mongoose.Types.ObjectId(leave.id)})
							.populate('pmanagerId')
							.exec((err,project)=>{
								var projects = [];
								for(i=0;i<project.length;i++){
									projects.push(...project[i].pmanagerId);
								}

								console.log("projects pdf pmmmmmmmmmmmmm",project);
								var object = [];
								_.forEach(projects, pro=>{
									object.push({ pmanagerId: pro });
								})
								userModel
								.findOne({userRole : "admin"})
								.exec((err, user)=>{
									if (err) {
										return (res.status(500).send(err));
									}else{
										admin = [];
										admin.push(user);
										var output = [];
										_.forEach(object, ob=>{
											output.push(ob.pmanagerId._id)
										})
										output.push(admin[0]._id);
										userModel
										.find({_id : output})
										.exec((err,mailId)=>{
											for(i=0;i<mailId.length;i++){
												maillist.push(mailId[i].email);
											}
											console.log("maillist=================>",maillist);
										})
										var pmName = [];
										pmName.join({});
										for(i=0;i<object.length;i++){
											var pmanagerId = object[i].pmanagerId.name;
											pmName.push({pmanagerId});
										}
										console.log("project=========>",projects);
										userModel
										.find({_id : leave.id})
										.exec((err,pm)=>{
											console.log("pmanager========================>",pm[0].userRole);
											projectModel
											.find({pmanagerId : leave.id})
											.exec((err,pmanager)=>{

												console.log("pmnager new============>",pmanager);

												if(pm[0].userRole == 'projectManager' ){
													if(duration == "0.5" || duration == "1"){
														var obj = {
															"subject" : "Project manager leave",
															"contentForAdmin" : leave.name+ " project manager of "+pmanager[0].title+ " has appiled for 1 day leave(" +req.body.startingDate+ ")",
															"sendTo" : output,"type" : "leave","pmStatus": pmName
														}
													}else{
														var obj = {
															"subject" : "Project manager leave",
															"contentForAdmin" : leave.name+ " project manager of "+pmanager[0].title+ " has appiled for "+req.body.duration+ " days leave (" +req.body.startingDate+ " to " +req.body.endingDate+ ")",
															"sendTo" : output,"type" : "leave","pmStatus": pmName

														}
													}

													
												}else{

													if(duration == "0.5" || duration == "1"){
														if(project && project.length && project[0].title){
															var obj = {
																"subject" :"Your Team member has applied for leave .",
																"contentForPm" : "Your teamMate <strong>" +leave.name+ "</strong> has applied for " + req.body.leaveDuration+ " day leave (" +req.body.startingDate+ ")",
																"contentForAdmin" : leave.name+" Team member of <strong>" +project[0].title+ "</strong> has applied for 1 day leave (" +req.body.startingDate+ ")","sendTo" : output,"type" : "leave","pmStatus": pmName
															}	
														}else{
															var obj = {
																"subject" :"Your Team member has applied for leave .",
																"contentForPm" : "Your teamMate <strong>" +leave.name+ "</strong> has applied for " + req.body.leaveDuration+ " day leave (" +req.body.startingDate+ ")",
																"contentForAdmin" : leave.name+" Developer of Raoinfotech has applied for 1 day leave (" +req.body.startingDate+ ")","sendTo" : output,"type" : "leave","pmStatus": pmName
															}	
														}

													}
													else{

														if(project && project.length && project[0].title){
															var obj = {
																"subject" :"Your Team member has applied for leave .",
																"contentForPm" : "Your teammate <strong>" +leave.name+ "</strong> has applied for " +req.body.leaveDuration+ " days leave (" +req.body.startingDate+ " to " +req.body.endingDate+ ")",
																"contentForAdmin" : leave.name+" Team member of <strong>" + project[0].title+ "</strong> has applied for "+ req.body.leaveDuration+ " days leave (" +req.body.startingDate+ " to " +req.body.endingDate+ ")","sendTo" : output,"type" : "leave","pmStatus": pmName
															} 															
														}
														else{
															var obj = {
																"subject" :"Your Team member has applied for leave .",
																"contentForPm" : "Your teammate <strong>" +leave.name+ "</strong> has applied for " +req.body.leaveDuration+ " days leave (" +req.body.startingDate+ " to " +req.body.endingDate+ ")",
																"contentForAdmin" : leave.name+" Developer of RaoInfotech has applied for "+ req.body.leaveDuration+ " days leave (" +req.body.startingDate+ " to " +req.body.endingDate+ ")","sendTo" : output,"type" : "leave","pmStatus": pmName
															} 
														}

													}
												}
												console.log("obj==================>",obj);
												var notification = new sendnotificationModel(obj);
												notification.save(function(err,SavedUser){
													if(err){
														return (res.status(500).send(err));
													}else{
														console.log("saveData=========================------->",SavedUser);
														notificationModel
														.find({userId: output})
														.exec((err, user)=>{
															console.log("userr====>",user);
															if (err) {
																console.log("err",err);
																return res.status(500).send(err);
															}else{
																req.session.user = user;
																req.session.userarray = [];
																console.log("length===>",user.length);
																for(i=0;i<user.length;i++){
																	req.session.userarray.push(req.session.user[i].token);
																}
																console.log("token array======>",req.session.userarray);
																pushNotification.postCode(obj.subject,obj.type,req.session.userarray);
															}
														})
													}

												})
											})
})
}
})
})
}
})

var type =req.body.typeOfLeave;
if(type == 'Sick_Leave'){
	leaveType = "Sick leave";
}
else if(type == 'Emergency_Leave'){
	leaveType = "Emergency leave";
}
else if(type == 'Leave_WithoutPay'){
	leaveType = "Without pay";
}
else{
	leaveType = "Personal leave";
}
if(req.body.leaveDuration == 0.5 || req.body.leaveDuration == 1){
	if(req.body.leaveDuration == 0.5){
		leaveDuration = "Half Day"
	}else{
		leaveDuration = "Full Day"
	}

	var output = `<!DOCTYPE html>
	<html>
	<head>
	<title>Mail Template</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body style="background-color: #F9F9F9;  font-family: sans-serif;">
	<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
	<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
	right: 0;box-shadow: 0px 0px 20px lightgray">

	<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
	<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">You have a new Leave Application from <span style="font-weight:bold;">`+req.body.name+`</span></h6>

	<center>
	<table style="border: none;">
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="far fa-user" style="margin-right: 20px;color: #181123"></i><b>Duration:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+leaveDuration+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="far fa-envelope" style="margin-right: 20px;color: #181123"></i><b>Date:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.startingDate+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="fab fa-skype" style="margin-right: 20px;color: #181123"></i><b>Type of leave:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+leaveType+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="fas fa-mobile-alt" style="margin-right: 23px;color: #181123"></i><b>Reason:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.reasonForLeave+`</td>
	</tr>
	</table>
	</center>
	</div>
	</div>
	
	</body>
	</html>`;

}else{
	var output = `<!DOCTYPE html>
	<html>
	<head>
	<title>Mail Template</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body style="background-color: #F9F9F9;  font-family: sans-serif;">
	<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
	<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
	right: 0;box-shadow: 0px 0px 20px lightgray">

	<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
	<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">You have a new Leave Application from <span style="font-weight:bold;">`+req.body.name+`</span></h6>

	<center>
	<table style="border: none;">
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="far fa-user" style="margin-right: 20px;color: #181123"></i><b>No. of days:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.leaveDuration+` days</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="far fa-envelope" style="margin-right: 20px;color: #181123"></i><b>Starting Date:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.startingDate+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="far fa-envelope" style="margin-right: 20px;color: #181123"></i><b>Ending Date:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.endingDate+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="fab fa-skype" style="margin-right: 20px;color: #181123"></i><b>Type of leave:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+leaveType+`</td>
	</tr>
	<tr>
	<td style="padding: 10px; color: #181123; font-size: 16px;"><i class="fas fa-mobile-alt" style="margin-right: 23px;color: #181123"></i><b>Reason:</b></td>
	<td style="color: #2b1252; font-size:16px;">`+req.body.reasonForLeave+`</td>
	</tr>
	</table>
	</center>
	</div>
	</div>
	</body>
	</html>`;
}

var mailOptions = {
	from: 'raoinfotechp@gmail.com',
	to: maillist,
	subject: 'New Leave Application',
	text: 'Hi, this is a testing email from node server',
	html: output
};

transporter.sendMail(mailOptions, function(error, info){
	if (error) {
		console.log("Error",error);
	} else {
		console.log('Email sent: ' + info.response);

	}
});
return res.status(200).send(leave)
}
})
}
})
}
// })
// }


leaveController.getTeamsByPmanagerId = function(req, res){
	var pmanagerId = req.params.pmanagerId;
	projectModel
	.find({pmanagerId :pmanagerId})
	.select('projects Teams')
	.exec((err , found)=>{
		if( err) 
			return res.send(err);
		else{
			return res.send(found);
		}
	})
}
leaveController.getLeaves = function(req,res){
	leaveModel.find({status: "pending"})
	.exec((err,resp)=>{
		if(err){ 
			console.log("error======>",err);
			return res.status(500).send(err) 
		}
		else{
			return res.status(200).send(resp)
		}
	})
}


leaveController.getLeavesById = function(req,res){
	console.log("details of body",req.body);
	leaveModel.find({email:req.body.email})
	// .populate('name')
	.exec((err,respond)=>{
		if(err){
			console.log("error",err);
			return	res.status(500).send(err)
		}
		else{
			userModel.find({email:req.body.email})
			// .populate('name')
			.exec((error , resp)=>{
				if(error){
					return res.status(500).send(error);
				}else{
					console.log("responsee of developers",resp);
					console.log("first resonse===============>",respond);
					if(respond.length){
						console.log("respond send")
						return (res.status(200).send(respond))
					} else{
						console.log("res send------------------->")
						return res.status(200).send(resp);
					}
				}
			})
		}
	})
}
leaveController.getAllLeaves = function(req,res){
	leaveModel.find({})
	.exec((err,respond)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err))
		}
		else{
			return (res.status(200).send(respond));
		}
	})
}

leaveController.getByUserId = function(req,res){
	useremail = req.params.useremail;
	leaveModel.find({email:useremail})
	.exec((err,respond)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err))
		}
		else{
			return (res.status(200).send(respond));
		}
	})
}

leaveController.getById = function(req,res){
	leaveId = req.params.leaveId;

	leaveModel.find({_id:leaveId})
	.exec((err,respond)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err))
		}
		else{
			return (res.status(200).send(respond));
		}
	})
}


leaveController.getApprovedLeaves = function(req,res){
	leaveModel.find({status:'approved'})
	.exec((err,respond)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err));
		}
		else{
			console.log("respnose of approved",respond);
			return (res.status(200).send(respond));
		}
	})
}



leaveController.getRejectedLeaves = function(req,res){
	leaveModel.find({status: 'rejected'})
	.exec((err,negative)=>{
		if(err){
			console.log("errrrrrr",err);
			return (res.status(500).send(err));
		}
		else{
			console.log("negative response=======>",negative);
			return (res.status(200).send(negative));
		}
	})
}

leaveController.getAllLeavesApps = function(req,res){
	leaveModel.find({})
	.exec((err,listOfLeaves)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err))
		}
		else{
			console.log("list of all leaves application",listOfLeaves);
			return (res.status(200).send(listOfLeaves));
		}
	})
}

leaveController.updateLeaves = function(req,res){
	leaveModel.findOneAndUpdate({_id: req.params.id},req.body,{upsert:true , new: true},function(err,update){
		var status = update.status;
		var email = update.email;
		var duration = update.leaveDuration;
		if(status == "approved"){
			projectModel
			.find({Teams : update.id})
			.exec((err,project)=>{
				projects = [];
				for(i=0;i<project.length;i++){
					console.log("push");
					projects.push(project[i].pmanagerId);
				}
				var object = [].concat.apply([],projects);
				notificationModel
				.find({userId: object})
				.exec((err, user)=>{
					if (err) {
						return (res.status(500).send(err));
					}else{
						projects = [];
						for(i=0;i<user.length;i++){
							projects.push(user[i].userId);
						}
						userModel
						.find({_id : projects})
						.exec((err,users)=>{
							if(err){
								return (res.status(500).send(err));
							}else{
								userrole = [];
								for(i=0;i<users.length;i++){
									userrole.push(users[i].userRole)
								}
								if( duration == "1" || duration == "0.5"){
									var obj2 = {
										"subject" : "approved leave","content" : "<strong>" +update.name+ "</strong> has applied for leave on " +req.body.startingDate+ " and it's approved.","sendTo" : projects,"type" : "leaveAccepted",
									}
									mailContent = update.name+ " has applied for leave on " +req.body.startingDate+ " and it's ";
								}else{
									var obj2 = {
										"subject" : "approved leave","content" : "<strong>" +update.name+ "</strong> has applied for leave on " +req.body.startingDate+ " to " + req.body.endingDate+ " and it's ","sendTo" : projects,"type" : "leaveAccepted",
									}

									mailContent = update.name+ " has applied for leave on " +req.body.startingDate+ " to " + req.body.endingDate+ " and it's approved.";

								}
								
								if(duration == "0.5" || duration == "1"){
									var	obj1 = {
										"subject" :"Congratulations! Your leave has been approved.","content" : "Hello <span style='color:red;'>"+update.name+"</span>, your leave application for " +req.body.startingDate+ " is <strong> approved </strong>.", "sendTo" : update.id,"type" : "leave-accepted"
									}
									if(duration == "0.5"){
										Duration = "half"
									} else{
										Duration = "1"
									}
									mailContentForDeveloper = Duration + "-day on " +req.body.startingDate+ " is "
									console.log("obj=======>",obj1);
								}else{
									var	obj1 = {
										"subject" :"Congratulations! Your leave has been approved.","content" : "Hello <span style='color:red;'>"+update.name+"</span>, your leave application form " +req.body.startingDate+ " to "+ req.body.endingDate+ " is <strong> approved </strong>.","sendTo" : update.id,"type" : "leave-accepted"
									}
									mailContentForDeveloper = req.body.leaveDuration + "-days on " +req.body.startingDate + " to " +req.body.endingDate+ " is "
									console.log("obj=======>",obj1);
								}
								var notification = new sendnotificationModel(obj1);
								notification.save(function(err,SavedUser){
									notificationModel
									.findOne({userId: update.id})
									.exec((err, user)=>{
										if (err) return (res.status(500).send(err));
										else
											if(user && user.token) pushNotification.postCode(obj1.subject,obj1.type,[user.token]);

									})
									var output = `<!DOCTYPE html>
									<html>
									<head>
									<title>Mail Template</title>
									<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
									</head>
									<body style="background-color: #F9F9F9;  font-family: sans-serif;">
									<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
									<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
									right: 0;box-shadow: 0px 0px 20px lightgray">

									<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
									<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">Congratulation! Your leave for `+ mailContentForDeveloper+` <span style="color:#28B463;font-weight:bold;">APPROVED.</span></h6>

									</div>
									</div>
									</body>
									</html>`;

									var mailOptions = {
										from: 'raoinfotechp@gmail.com',
										to:email,
										subject: 'Leave Approval',
										text: 'Hi, this is a testing email from node server',
										html: output
									};
									transporter.sendMail(mailOptions, function(error, info){
										if (error) {
											console.log("Error",error);
										} else {
											console.log('Email sent: 586' + info.response);
										}
									});
									
									var output1 = `<!DOCTYPE html>
									<html>
									<head>
									<title>Mail Template</title>
									<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
									</head>
									<body style="background-color: #F9F9F9;  font-family: sans-serif;">
									<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
									<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
									right: 0;box-shadow: 0px 0px 20px lightgray">

									<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
									<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">Your teammate `+mailContent+` <span style="color:#35b139;"> Approved</span>.</h6>

									</div>
									</div>
									</body>
									</html>`;
									var mailOptions1 = {
										from: 'raoinfotechp@gmail.com',
										to: maillist,
										subject: 'Leave Approval',
										text: 'Hi, this is a testing email from node server',
										html: output1
									};
									transporter.sendMail(mailOptions1, function(error, info){
										if (error) {
											console.log("Error",error);
										} else {
											console.log('Email sent: 618' + info.response);
										}
									});
								})
								var notification = new sendnotificationModel(obj2);
								notification.save(function(err,SavedUser){
									notificationModel
									.findOne({userId: projects})
									.exec((err, user)=>{
										if (err) 
											return (res.status(500).send(err));
										else
											if(user == null)
												return (res.status(200).send(update));
											else
												if(user &&user.token) pushNotification.postCode(obj2.subject,obj2.type,[user.token]);
											return (res.status(200).send(update));

										})

								})
								userModel
								.find({_id : projects})
								.exec((err,mailId)=>{
									for(i=0;i<mailId.length;i++){
										maillist.push(mailId[i].email);
									}
								})
							}
						})
}

})
})

}else if(status == "rejected"){


	var output = `<!DOCTYPE html>
	<html>
	<head>
	<title>Mail Template</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body style="background-color: #F9F9F9;  font-family: sans-serif;">
	<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
	<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
	right: 0;box-shadow: 0px 0px 20px lightgray">

	<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
	<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">Sorry! Your leave for ` + mailContentForDeveloper+` <span style="color:#E74C3C;font-weight:bold;">REJECTED</span>.</h6>

	</div>
	</div>
	</body>
	</html>`;
	var mailOptions = {
		from: 'raoinfotechp@gmail.com',
		to: email,
		subject: 'Leave Reject',
		text: 'Hi, this is a testing email from node server',
		html: output
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log("Error",error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	})
	var output1 = `<!DOCTYPE html>
	<html>
	<head>
	<title>Mail Template</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body style="background-color: #F9F9F9;  font-family: sans-serif;">
	<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
	<div style="width: 500px; margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
	right: 0;box-shadow: 0px 0px 20px lightgray">
	<div style="background-image: url(https://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
	<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center">Your teammate `+mailContent+`<span style="color:#dc5871;"> Rejected</span>.</h6>

	</div>
	</div>
	</body>
	</html>`;

	var mailOptions1 = {
		from: 'raoinfotechp@gmail.com',
		to: maillist,
		subject: 'Leave Rejection',
		text: 'Hi, this is a testing email from node server',
		html: output1
	};
	transporter.sendMail(mailOptions1, function(error, info){
		if (error) {
			console.log("Error",error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
	projectModel
	.find({Teams : update.id})
	.exec((err,project)=>{
		console.log("projects=========>",project);
		projects = [];
		for(i=0;i<project.length;i++){
			console.log("push");
			projects.push(project[i].pmanagerId);
		}
		var object = [].concat.apply([],projects);
		notificationModel
		.find({userId: object})
		.exec((err, user)=>{
			if (err) {
				return (res.status(500).send(err));
			}else{
				projects = [];
				for(i=0;i<user.length;i++){
					console.log("push");
					projects.push(user[i].userId);
				}
				if(duration == "1" || duration == "0.5"){
					var obj2 = {
						"subject" : "rejected leave", "content" : "" +update.name+ " has applied for leave on " +req.body.startingDate+ " and it's <strong> rejected </strong>.",
						"sendTo" : projects,"type" : "leaveAccepted",
					}
				}else{
					var obj2 = {
						"subject" : "rejected leave ", "content" : "" +update.name+ " has applied for leave on " +req.body.startingDate+ " to " + req.body.endingDate+ "and it's <strong> rejected </strong>.",
						"sendTo" : projects,"type" : "leaveAccepted",
					}
				}
			}
			userModel
			.find({_id : projects})
			.exec((err,mailId)=>{
				for(i=0;i<mailId.length;i++){
					maillist.push(mailId[i].email);
				}
				console.log("maillist===========>",maillist);
			})
			var notification = new sendnotificationModel(obj2);
			notification.save(function(err,SavedUser){

				notificationModel
				.findOne({userId: projects})
				.exec((err, user)=>{
					if (err) {
						return (res.status(500).send(err));
					}
					else{
						if(user && user.token) pushNotification.postCode(obj2.subject,obj2.type,[user.token]);
					}
				})
				if(duration == "1" || duration == "0.5"){
					var	obj1 = {
						"subject" :"Sorry! Your leave has been rejected.","content" : "Sorry "+update.name+", your leave application for " +req.body.startingDate+ " is <strong> rejected </strong>.", 
						"sendTo" : update.id,"type" : "leave-rejected"
					}
					mailContent = update.name+ " has applied for leave on " +req.body.startingDate+ " and it's";
				}
				else{
					var	obj1 = {
						"subject" :"Sorry! Your leave has been rejected.","content" : "Sorry "+update.name+", your leave application form " +req.body.startingDate+ " to "+ req.body.endingDate+ " is <strong> rejected </strong>.", 
						"sendTo" : update.id,"type" : "leave-rejected"
					}
					mailContent = update.name+ " has applied for leave on " +req.body.startingDate+ " to " + req.body.endingDate+ " and it's";
				}
				var notification = new sendnotificationModel(obj1);
				notification.save(function(err,SavedUser){
					notificationModel
					.findOne({userId: update.id})
					.exec((err, user)=>{
						console.log("useer==>",user);
						if (err) {
							return (res.status(500).send(err));
						}
						else{
							if(user == null){
								return (res.status(200).send(update))

							}
							else{
								if(user && user.token) pushNotification.postCode(obj1.subject,obj1.type,[user.token]);
							}
						}
					})
				})

				return (res.status(200).send(update))

			})
		})
	})
}
else{
	console.log("mail not send");
}
})

}
leaveController.AddComments = function(req,res){
	leaveId = req.body.leaveId;
	comment = req.body.comment;
	leaveModel.findOneAndUpdate({_id:leaveId},{$set:{comment:comment}},{upsert:true, new:true})
	.exec((err,comments)=>{
		if(err){
			console.log("error",err);
			return (res.status(500).send(err))
		}
		else{
			return (res.status(200).send(comments));
		}
	})
}

module.exports = leaveController;