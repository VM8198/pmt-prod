var commentModel = require('./../model/comment.model');
var notificationModel = require('../model/notification.model');
var taskModel = require('../model/tasks.model')
var userModel = require('./../model/user.model');
var sendnotificationModel = require('../model/sendNotification.model');
var projectModel = require('../model/project.model');
var dir = require('node-dir');
var mkdir = require('mkdirp');
var path = require('path');
var fs = require('fs');
var commentController = {};
var pushNotification = require('./../service/push-notification.service');
var nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
var _ = require('lodash');
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

commentController.addComment = function(req,res){
	console.log(req.body);
	var uploadPath = path.join(__dirname, "../uploads/"+req.body.projectId+"/"+req.body.taskId+"/comment/");
	console.log(uploadPath);
	req.file('fileUpload').upload({
		maxBytes: 500000000,
		dirname: uploadPath,
		saveAs: function (__newFileStream, next) {
			dir.files(uploadPath, function(err, files) {
				if (err){
					mkdir(uploadPath, 0775);
					return next(undefined, __newFileStream.filename);
				}else {
					return next(undefined, __newFileStream.filename);
				}
			});
		}
	}, function(err, files){
		if (err) {
			console.log(err);
			return (res.status(415).send(err));
		}else{
			console.log(files)
			var comment = new commentModel(req.body);
			var fileNames=[];
			if(files.length>0){
				_.forEach(files, (gotFile)=>{
					fileNames.push(gotFile.fd.split('/uploads/').reverse()[0])
				})
			}
			comment['images']=fileNames;
			comment.save(function(err, comment){
				if (err) {
					return (res.status(500).send(err));
				}
				console.log(comment);
				taskModel
				.findOne({ _id : comment.taskId})
				.exec((error, task)=>{
					projectModel
					.find({_id : task.projectId})
					.exec((err,project)=>{
						userModel
						.find({_id : comment.userId})
						.exec((err, user)=>{
							if(user[0].userRole == 'projectManager'){
								obj = {
									"subject": "commented on your task","content": user[0].name+" commented on " + task.uniqueId+" "+ task.type+ ".",
									"sendTo" : task.assignTo,"type": "comment",
								}
								mailContent = obj.content;
								var notification = new sendnotificationModel(obj);
								notification.save(function(err,SavedUser){
									notificationModel
									.find({userId: task.assignTo})
									.exec((err,user)=>{
										if(user && user.token)
										pushNotification.postCode(obj.subject,obj.type,[user[0].token]);
									})
								})

							}else{
								projectModel
								.findOne({_id : task.projectId})
								.exec((err,pmanager)=>{

									var pmId = pmanager.pmanagerId[0];
									obj = {
										"subject": "commented on your task","content": user[0].name+" reply of " + task.uniqueId+" "+ task.type+ ".",
										"sendTo" : pmanager.pmanagerId[0],"type": "comment",
									}
									var notification = new sendnotificationModel(obj);
									notification.save(function(err,pmanager){
										notificationModel
										.find({userId : pmId})
										.exec((err,pm)=>{
											pushNotification.postCode(obj.subject,obj.type,[pm[0].token]);
										})
									})

								})
							}
							userModel
							.find({_id : task.assignTo})
							.exec((err,mailId)=>{
								maillist.push(mailId[0].email);
							})
							var output = `<!DOCTYPE html>
							<html>
							<head>
							<title>Mail Template</title>
							<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
							</head>
							<body style="background-color: #F9F9F9;  font-family: sans-serif;">
							<center><img src="https://raoinformationtechnology.com/theme/images/raoinfotech-logo.png" height="40px" width="90px" style="position: fixed;left: 0px;right: 0px; margin: auto;top: 35px;"></center>
							<div style="width: 500px;  margin: auto; background-color: white; top: 100px; position: fixed;left: 0;
							right: 0;box-shadow: 0px 0px 20px lightgray">

							<div  style="background-image: url(http://1f58eb32.ngrok.io/bg-img.png); background-repeat: no-repeat;background-size: cover;background-color: #3998c51c; padding: 15px 0px">
							<span style="margin: 0px;color: #181123;font-size: 15px;text-align: center;">`+user[0].name+`  added a comment on <span>`+task.type+`</span></span>
							<span style="color: #bf4444;font-size: 15px; font-weight: 600;line-height: 19px;"><b>`+task.title+`</b></span></br><span style="color: #181123;font-size: 15px;line-height: 25px;"> in `+project[0].title+` / `+project[0].uniqueId+`</span><div style="border-bottom:1px solid #ccc;margin:5px 0px 30px 0px;height:1px"></div><span style="color: #444;font-weight: 600;font-size: 15px;">`+user[0].name+` said:</span><p style="color: #444;">`+comment.content+`</p>
							</div>
							</div>
							</body>
							</html>`;
							var mailOptions = {
								from: 'tnrtesting2394@gmail.com',
								to: maillist,
								subject: 'For Comment',
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
							return (res.status(200).send(comment));
						})
					})
				})
			})
		}
	})
}

commentController.getAllComment = function(req,res){
	commentModel
	.find({taskId: req.params.taskId})
	.populate('userId')
	.exec((err,comment)=>{
		if (err){
			return (res.status(500).send(err));
		}
		return (res.status(200).send(comment));
	})
}

commentController.getCommentByUserId = function(req,res){
	commentModel.find({userId: req.body.userId})
	.exec((err, comments)=>{
		if (err) {
			return (res.status(500).send(err));
		}else if(comments && comments.length){
			return (res.status(200).send(comments))
		}else{
			return (res.status(404).send("No comments for this user"));
		}
	})
}

commentController.getCommentByCommentId = function(req,res){
	commentModel.findOne({_id: req.params.id},function(err,comment){
		if (err) {
			return (res.status(500).send(err));
		}
		return (res.status(200).send(comment));
	})
}

commentController.deleteCommentByUserId = function(req,res){
	console.log("req params ==========>",req.body, req.params);
	commentModel.findOne({userId: req.body.userId})
	.exec((err,user)=>{
		if (err) {
			return (res.status(500).send(err)); 
		}
		else if(user)
		{
			commentModel.findByIdAndRemove({_id: req.params.id})
			.exec((error,resp)=>{
				if (resp) {
					return (res.status(200).json({msg: "comment deleted successfully!!!"}))
				}

				else return (res.status(500).send(error));
			})
		}
	})
}

commentController.getCommentByUserId = function(req,res){
	commentModel.find({userId: req.body.userId})
	.exec((err, comments)=>{
		if (err) {
			return (res.status(500).send(err));
		}else if(comments && comments.length){
			return (res.status(200).send(comments))
		}else{
			return(res.status(404).send("No comments for this user"));
		}
	})
}

commentController.getCommentByCommentId = function(req,res){
	commentModel.findOne({_id: req.params.id},function(err,comment){
		if (err) {
			return (res.status(500).send(err));
		}
		return (res.status(200).send(comment));
	})
}

commentController.deleteCommentByCommentId = function(req,res){
	commentModel.findOneAndRemove({_id: req.params.id}, function(err,comment){
		if (err) {
			return (res.status(500).send(err));
		}
		return (res.status(200).send(comment));
	})
}

commentController.updateCommentByCommentId = function(req,res){
	commentModel.findOneAndUpdate({_id: req.params.id},req.body, {upsert: true, new: true}, 
		function(err, comment){
			if (err)
			{
				return (res.status(500).send(err));
			}
			return (res.status(200).send(comment));
		})
}

module.exports = commentController;