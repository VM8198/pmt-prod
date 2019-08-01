var userModel = require('../model/user.model');
var taskModel = require('../model/task.model');
var bugModel = require('../model/bug.model');
var projectModel = require('../model/project.model');
var issueModel = require('../model/issue.model');
SALT_WORK_FACTOR = 10;
var async = require('async');
var userController = {};
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var mkdir = require('mkdirp');
var path = require('path');
var fs = require('fs');
var dir = require('node-dir');
var _ = require('lodash');
var notificationModel = require('../model/notification.model'); 
var sendnotificationModel = require('../model/sendNotification.model');

var nodemailer = require ('nodemailer');
const smtpTransport = require ('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'secret'; // Create custom secret for use in JWT
var pushNotification = require('./../service/push-notification.service');


userController.addUser = function(req,res){
	console.log("req body ===>" , req.body);
	userModel.findOne({email: req.body.email})
	.exec((err,founduser)=>{
		if (err) {
			res.status(500).send(err);
		}else if (founduser){
			res.status(409).send('user already exists! ');
		}else{
			var User = new userModel(req.body);
			User.save((err, newUser)=>{
				if (err) {
					res.status(500).send(err);
				}
				else{

				// res.status(200).send(newUser);
				console.log("newuser",newUser);
				var uploadPath = path.join(__dirname, "../uploads/"+newUser._id+"/");
				console.log("userid===>",newUser._id);
				console.log("uploadprofile path===>",uploadPath);
				req.file('profilePhoto').upload({
					maxBytes: 50000000,
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
						res.status(500).send(err);
					}else{
						console.log("files==========>",files)
						// res.status(200).send("files uploaded successfully");
						for(var i=0;i<files.length;i++){
							if(_.includes(files[i].filename, '.pdf')){
								var cv = files[i].fd.split('/uploads/').reverse()[0];
							}else{
								var profile = files[i].fd.split('/uploads/').reverse()[0];
							}
						}
						newUser['CV'] = cv;
						newUser['profilePhoto'] = profile;
						userModel.findOneAndUpdate({_id: newUser._id}, {$set: {CV:cv, profilePhoto:profile }}, {upsert:true, new:true}, ).exec((error,user)=>{
							if (error) res.status(415).send(error);
							res.status(200).send(user);
						})
					}

				})
			}		
		});	
		}			
	})
}

userController.getSingleUser = function(req, res){
	console.log("req.paras ===>" , req.params.userId);
	userModel.findOne({_id:req.params.userId}, function(err,getuser){
		if(err){
			res.status(500).send(err);
		}
		console.log(getuser);
		res.status(200).send(getuser);
	})
}

userController.resetPassword = function(req,res){ 
	console.log(req.body);
	userModel.findOne({ email:req.body.email}).exec((err,user)=>{
		if (err) {
			res.status(500).send(err);
		}else if (user) {
			console.log("====================> USer", user);
			user.comparePassword(req.body.currentPassword, user.password, (error, isMatch)=>{
				if (error){
					return res.status(500).send(error);
				}else if(isMatch){
					user.password = req.body.newPassword;
					user.save();
					console.log(user);
					res.status(200).send(user);
				}
				else{
					return res.status(412).send( { errMsg : 'password does not match' });	
				}
			});
		}else{
			return res.status(400).send( { errMsg : 'Bad request' });
		}
	})
}

userController.updateUserById = function(req,res){
	var userId = req.params.userId;
	console.log("userId is==============>",userId);
	userModel
	.findByIdAndUpdate({_id:userId},{$set:req.body},{upsert:true, new:true},function(err,getuser){

		if(err){
			res.status(500).send(err);
		}
		else{
			var uploadPath = path.join(__dirname, "../uploads/"+getuser._id+"/");
			console.log("IN UPDATE DETAILS==============>",uploadPath);
			req.file('cv').upload({
				maxBytes: 50000000000000,
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
					res.status(500).send(err);
				}else{
					console.log(files);
					console.log("files==========>",files)
					var cv = "";
					if(files && files.length)
						cv = files[0].fd.split('/uploads/').reverse()[0];
					getuser['CV'] = cv;
					userModel.findOneAndUpdate({_id: userId}, {$set: {CV:cv }}, {upsert:true, new:true}).exec((error,user)=>{
						if (error){ 
							res.status(415).send(error);
						}else{
							console.log(user);
							res.status(200).send(user);
						}
					})
				}

			})
		}
	})
}
userController.getAllUsers = function(req, res){
	userModel.find({isDelete: false})
	.exec((err,users)=>{
		if (err) {
			res.status(500).send(err);
		}
		else if (users){
			res.status(200).send(users);
		}else{
			res.status(404).send( { msg : 'Users not found' });
		}
	})
}

userController.getAllProjectManager = function(req, res){
	console.log("all project Manager==>>");
	userModel.find({userRole:'projectManager'})
	.exec((err,users)=>{
		if (err) {
			res.status(500).send(err);
		}else if (users){
			res.status(200).send(users);
		}else{
			res.status(404).send( { msg : 'User not found' });
		}
	})
}

userController.getAllUsersByProjectManager = function(req, res){
	var uniqueArray = [];
	projectModel
	.find({pmanagerId: req.body.pmId})
	.populate('tasks')
	.exec((err, project)=>{
		if(err){
			res.status(500).send(err);
		}else{
			_.forEach(project, (pro)=>{
				uniqueArray.push(...pro.Teams);
			})
			userModel
			.find({_id: { $in: uniqueArray }, userRole:'user'})
			.exec((error, users)=>{
				if (err) {
					res.status(500).send(err);
				}else if (users){
					console.log(users);
					res.status(200).send(users);
				}else{
					res.status(404).send( { msg : 'Users not found' });
				}
			})
		}
	})
}


userController.logIn = function(req,res){
	console.log("req.method" , req.body);
	if(req.method == 'POST' && req.body.email && req.body.password){
		userModel.findOne({ email : req.body.email } )
		// .select('-password')
		.exec((err, user)=>{
			// console.log(user, err);
			if (err) {
				return res.status(500).send( { errMsg : err });
			}else if(user){
				user.comparePassword(req.body.password, user.password,(error, isMatch)=>{
					if (error){
						return res.status(500).send( { errMsg : ' error'});
					}else if(isMatch){
						var role = user.userRole;
						(user.userRole==='user')?req.session.user = user:req.session.projectManager = user;
						req.session.authenticated = true;
						console.log("SESSION=============>",req.session.user, req.session.projectManager);
						const payload = {user};
						var token = jwt.sign(payload,'pmt');
						console.log("Token = ",token);
						return res.status(200).send({data:user,
							token: token});
					}else{
						return res.status(412).send( { errMsg : 'Wrong password. Try again or click Forgot password to reset it.' });	
					}
				});
			}else{
				return res.status(404).send( { errMsg : 'Could not find your username' });
			}
		});
	}else{
		return res.status(400).send({errMsg : 'Bad Data'});
	}
}


userController.changeProfileByUserId = function(req,res){
	console.log("userId is==============>", req.file('profilePhoto'));
	var userId = req.params.id
	var uploadPath = path.join(__dirname, "../uploads/"+userId+"/");
	console.log("IN UPDATE PROFILE=============>",uploadPath);
	req.file('profilePhoto').upload({
		maxBytes: 50000000000000,
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
			res.status(500).send(err);
		}else{
			console.log(files);
			console.log("files==========>",files)

			var profile = files[0].fd.split('/uploads/').reverse()[0];
			// getuser['profilePhoto'] = profile;
			userModel.findOneAndUpdate({_id: userId}, {$set: {profilePhoto:profile }}, {upsert:true, new:true}).exec((error,user)=>{
				if (error){ 
					res.status(415).send(error);
				}else{
					console.log(user);
					res.status(200).send(user);
				}
			})
		}

	})
	
}

userController.getDevelpoersNotInProjectTeam = function(req, res){
	projectModel
	.findOne({_id: req.params.projectId})
	.exec((err, project)=>{
		if(err)
			res.status(500).send(err)
		else{
			
			userModel
			.find({_id: {$nin: project.Teams}})
			.exec((error, developers)=>{
				if (err) {
					return (res.status(404).send(error));
				}else{
					res.status(200).send(developers)
				}
			})
		}
	})
}


userController.forgotPassword = function (req,res) {
	console.log("forgot password");
	console.log(req.headers.referer);
	userModel.findOne({ email : req.body.email } )
	.exec((err, user)=>{
		if (err) {
			return res.status(500).send( { errMsg : err });
		}else if(user){
			// console.log(user.name);
			user.temporarytoken = jwt.sign({ name: user.name, email: user.email }, secret, { expiresIn: '10min' }); // Create a token for activating account through e-mail
			// console.log(user.temporarytoken);
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
			<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center"><b>Hello `+ user.name +`</b></h6>
		
			<div style="margin-left:30px;padding:0;">
			<p style="font-size:15px;">You, or someone else, requested an new password for this account on Project Management Tool</p>
			<p style="font-size:15px;">You can reset your password using given link below. When you do nothing, your password or account will not change.</p>
			<p style="font-size:15px;"><a href="http://localhost:4200/#/forgotpwd/` + user.temporarytoken + `">http://localhost:4200/#/forgotpwd</a></p>
			<p style="font-size:15px;">This link will expires in 10 minutes.</p>
			</div>
			</div>
			</div>
			
			</body>
			</html>
			`;
			var outputLive = `<!DOCTYPE html>
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
			<h6 style="margin: 0px;color: #181123;font-size: 20px;text-align: center"><b>Hello `+ user.name +`</b></h6>
		
			<div style="margin-left:30px;padding:0;">
			<p style="font-size:15px;">You, or someone else, requested an new password for this account on Project Management Tool</p>
			<p style="font-size:15px;">You can reset your password using given link below. When you do nothing, your password or account will not change.</p>
			<p style="font-size:15px;"><a href="https://raoinformationtechnology-conduct.tk/#/forgotpwd/` + user.temporarytoken + `">https://raoinfotech-conduct.tk/#/forgotpwd</a></p>
			<p style="font-size:15px;">This link will expires in 10 minutes.</p>
			</div>
			</div>
			</div>
			
			</body>
			</html>
			`;
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


			if(req.headers.referer == "http://localhost:4200/"){
				var mailOptions = {
					from: 'raoinfotechp@gmail.com',
					to: req.body.email,
					subject: 'Localhost Forgot Password Request',
					text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://localhost:4200/#/forgotpwd/'+ user.temporarytoken,
					html: output
				};
			}

			else if (req.headers.referer == "https://raoinformationtechnology-conduct.tk/"){
				var mailOptions = {
					from: 'raoinfotechp@gmail.com',
					to: req.body.email,
					subject: 'Forgot Password Request',
					text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="https://raoinformationtechnology-conduct.tk/#/forgotpwd/'+ user.temporarytoken,
					html: outputLive
				};
			}

			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					return res.status(400).send( { errMsg : 'Bad request' });
				} else {
					console.log('Email sent: ' + info.response);
					res.status(200).send(user);
				}
			});
		}else{
			return res.status(404).send( { errMsg : 'Could not find your username' });
		}
	});
}
userController.updatePassword = function (req,res) {
	var token = req.body.token;
	jwt.verify(token, secret, function(err, decoded) {
		// console.log(decoded);
		userModel.findOne({ email:decoded.email }).exec((err,user)=>{
			if (err) {
				return res.status(500).send( { errMsg : err });
			}else if(user){
				user.password = req.body.password;
				user.save(function(error, changedUser) {
					if (error) res.status(408).send({ errMsg : "Not authorised" });
					res.status(200).send({ msg:"password changed" });
				});
			}
			else{
				res.status(401).send({ errMsg : "Not authorised" });
			}
		});
	}); 
}


userController.getProjectMngrNotInProject = function(req, res){
	console.log("getProjectMngrNotInProject");
	projectModel
	.findOne({_id: req.params.projectId})
	.exec((err, project)=>{
		if(err)
			res.status(500).send(err)
		else{
			userModel
			.find({$and: [{_id: {$nin: project.pmanagerId}},{userRole:'projectManager'}]})
			.exec((error, developers)=>{
				if (err) {
					res.status(404).send(error);
				}else{
					res.status(200).send(developers)
				}
			})
		}
	})
}

userController.deleteUserById = function(req,res){

	var userId = req.params.userId;
	console.log("remove developer is ===========>>><<<",userId);
	userModel.findOneAndUpdate({_id:userId},{$set: {isDelete: true}}, {upsert:true, new:true}).exec(function(err,user){
		if(err){
			res.status(500).send(err);
		} else{
			res.status(200).send(user);
			console.log("user is========>",user);	
		}
	})
	
}

module.exports = userController; 


