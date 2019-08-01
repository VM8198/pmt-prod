var notificationModel = require('../model/notification.model');
var sendnotificationModel = require('../model/sendNotification.model');
var projectModel = require('../model/project.model');
var userModel = require('../model/user.model');
let sendnotificationController = {};
var pushNotification = require('./../service/push-notification.service');
var nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
var pushNotification = require('./../service/push-notification.service');
var maillist = [];
var obj = {};
var mailContent = {};

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

sendnotificationController.addNotification = function(req, res){
	var temp =  req.body.sendTo;
	temp =  temp.split(",");
	req.body.sendTo = temp;
	projectModel.findOne({_id: req.body.projectId})
	.exec((err,projectId)=>{
		if (err){
			res.status(500).send(err);
		}else{
			if (err) {
				console.log("errrr",err);
				return (res.status(404).send(err));
			} else {
				projectModel
				.find({_id : req.body.projectId})
				.exec((err,project)=>{		
				console.log("send to============>",req.body.sendTo.length)			
					if(req.body.sendTo.length = 1){
						obj = {
							"subject": "You have new notification from Pmanager.",
							"content" : req.body.pmanagerName + " project manager of " +project[0].title+ " notified to you  that "+req.body.content+ ".",
							"sendTo": req.body.sendTo,"type" : "other"
						}
						mailContent = req.body.pmanagerName+ " project manager of " +project[0].title+ " notified to you";
					} else {
						obj = {
							"subject": "You have new notification from Pmanager.","content" : req.body.pmanagerName + " project manager of " +project[0].title+ " notified to you that "+req.body.content+ ".",
							"sendTo": req.body.sendTo,"type" : "other"
						}
						mailContent = req.body.pmanagerName+ " project manager of " +project[0].title+ " notified to all team member";
					}

					
					userModel
					.find({_id : req.body.sendTo})
					.exec((err,mailId)=>{
						for(i=0;i<mailId.length;i++){
							maillist.push(mailId[i].email);
						}
						console.log("maillist============>",maillist);						
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
					<h6 style="margin: 0px;color: #181123;font-size: 16px;text-align: center">`+ mailContent +` that `+ req.body.content+`.</h6>
					</div>
					</div>
					</body>
					</html>`;
					var mailOptions = {
						from: 'raoinfotechp@gmail.com',
						to: 'foramtrada232@gmail.com',
						subject: 'For New Notice',
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
					var notification = sendnotificationModel(obj);
					notification.save(function(err,SavedUser){
						notificationModel
						.find({userId: SavedUser.sendTo})
						.exec((err, user)=>{
							if (err) {
								console.log("err",err);
								return (res.status(404).send(err));
							} else {
								req.session.user = user;
								req.session.userarray = [];
								for(i=0;i<user.length;i++){
									req.session.userarray.push(req.session.user[i].token);
								}
								if (user == null) {
									return (res.status(200).send(SavedUser));
								} else {
									pushNotification.postCode(obj.subject,obj.type,req.session.userarray);
								}
							}
						})
						return (res.status(200).send(SavedUser));
					})
				})
			}
		}
	})
}

sendnotificationController.getNotificationByUserId = function(req,res){
	var sendTo = req.params.id;
	sendnotificationModel
	.find({sendTo : sendTo})
	.exec((err,user)=>{
		if (err) {
			res.status(500).send(err);
		} else {
			for(i=0;i<user.length;i++){
				sendnotificationModel
				.findOneAndUpdate({_id:user[i]._id} , {upsert:true,new:true})
				.exec((err , updatedFlag)=>{
					if (err){
						res.status(500).send(err);
					} else {
						updatedFlag.seenFlag = true;

						updatedFlag.save();
					}
				})	
			}

			res.status(200).send(user);
		}
	})
}

sendnotificationController.getUnreadNotification = function(req,res){
	var seenFlag = 'false';
	var unreadNotification = [];
	var sendTo = req.params.id;
	sendnotificationModel
	.find({sendTo : sendTo})
	.exec((err,unread)=>{
		if (err){
			res.status(500).send(err);
		} else {
			for(i=0;i<unread.length;i++){
				if (unread[i].seenFlag == false) {
					unreadNotification.push(unread);
				}
			}
			res.status(200).send(unreadNotification);
		}
	})
}

sendnotificationController.updateNotificationByStatus = function(req,res){
	var leaveId = req.params.id;
	var leaveStatus = req.params.status;
	sendnotificationModel
	.findByIdAndUpdate({_id:leaveId} , {upsert:true,new:true})
	.exec((err , notification)=>{
		if (err) {
			res.status(500).send(err);
		} else {
			console.log("notification===========>",notification);
			sendnotificationModel
			.findByIdAndUpdate({})
			if (leaveStatus == 'approved') {
				notification.pmStatus[0].leaveStatus = 'approved' ;
				 notification.pmStatus[0].isPending = 'true';
				notification.save();
				console.log("NOTIFICATION:",notification);
			} else {
				notification.pmStatus[0].leaveStatus = 'rejected' ;
				 notification.pmStatus[0].isPending = 'true';

				notification.save();
			}

			res.status(200).send(notification);
		}
	})
}

module.exports = sendnotificationController; 




