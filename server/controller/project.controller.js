var projectModel = require('../model/project.model');
var notificationModel = require('../model/notification.model');
var sendnotificationModel = require('../model/sendNotification.model');
var userModel = require('../model/user.model');
var sprintModel = require('../model/sprint.model');
let projectController = {};
var dir = require('node-dir');
var mkdir = require('mkdirp');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var async = require("async");
var pushNotification = require('./../service/push-notification.service');


projectController.addProject = function (req, res) {
	console.log("req body", req.body);
	var flag = 5;
	projectModel.find({}).exec((err, allProjects) => {
		for (var i = 0; i < allProjects.length; i++) {
			if (allProjects[i].uniqueId == req.body.uniqueId) {
				flag = 4;
			}
		}
		if (flag != 5) {
			return (res.status(500).send({ errMgsg: "project alias is duplicate" }));
		}
		else {
			var newProject = new projectModel(req.body);
			newProject.save(function (err, savedProject) {
				if (err) return (res.status(500).send(err));
				else {
					var uploadPath = path.join(__dirname, "../uploads/" + savedProject._id + "/avatar/");
					console.log(uploadPath);
					req.file('uploadfile').upload({
						maxBytes: 50000000000000,
						dirname: uploadPath,
						saveAs: function (__newFileStream, next) {
							dir.files(uploadPath, function (err, files) {
								if (err) {
									mkdir(uploadPath, 0775);
									return next(undefined, __newFileStream.filename);
								} else {
									return next(undefined, __newFileStream.filename);
								}
							});
						}
					}, function (err, files) {
						if (err) {
							console.log(err);
							return (res.status(500).send(err));
						} else {
							console.log(files)
							var fileNames = savedProject.avatar;
							if (files.length > 0) {
								_.forEach(files, (gotFile) => {
									fileNames = gotFile.fd.split('/uploads/').reverse()[0];
								})
							}
							projectModel
								.findOneAndUpdate({ _id: savedProject._id }, { $set: { avatar: fileNames } }, { upsert: true, new: true })
								.exec((err, project) => {
									if (err) {
										console.log(err);
										return (res.status(500).send(err));
									} else {

										var sprintdata = {
											projectId: savedProject._id,
											startDate: "",
											endDate: "",
											title: savedProject.uniqueId + 'Sprint-1',
											status: 'Future',
											goal: ''
										}
										var newSprint = new sprintModel(sprintdata);
										newSprint.save();
										return (res.status(200).send(project));
									}
								})
						}
					})
				}
			})
		}
	})
}



projectController.getAllProject = function (req, res) {
	projectModel
		.find({})
		.populate('pmanagerId taskId IssueId BugId Teams tasks')
		.populate({
			path: ' taskId IssueId BugId tasks',
			populate: { path: 'assignTo' }
		})
		.exec(function (err, projects) {
			if (err) {
				console.log("errrrrrrrrrrrror===================>", err);
				return (res.status(500).send(err));
			} else if (projects) {
				return (res.status(200).send(projects));
			} else {
				return (res.status(404).send("NOT FOUND"));
			}
		})

}

projectController.getProjectById = function (req, res) {
	// var userId = req.params.userId;
	var projectId = req.params.projectId;
	console.log("user id mdvu joye and project is mdvu joye", projectId);
	projectModel
		.findOne({ _id: projectId })
		.populate('tasks pmanagerId Teams')
		// .populate({
		// 	path: 'taskId IssueId BugId',
		// 	populate: { path: 'assignTo' }
		// })
		.exec(function (err, projects) {
			if (err) {
				return (res.status(500).send(err));
			} else if (projects) {
				console.log("kaik avje =============", projects);
				_.map([...projects.taskId, ...projects.IssueId, ...projects.BugId], function (ele) {
					if (ele.assignTo == null) {
						ele.assignTo = "";
					}
				})
				return (res.status(200).send(projects));
			} else {
				return (res.status(404).send("NOT FOUND"));
			}
		})

}

projectController.deleteProjectById = function (req, res) {

	var projectId = req.params.projectId;
	projectModel.findOneAndUpdate({ _id: projectId }, { $set: { isDelete: true } }, { upsert: true, new: true }).exec(function (err, projects) {
		if (err) {
			console.log("err==========>>>", err);
			res.status(500).send(err);
		} else {
			console.log("saved console 4 projects===========>", projects);
		return (res.status(200).send(projects));
		}
		
	})
}

projectController.updateProjectById = function (req, res) {
	var projectId = req.params.projectId;
	if (req.body.pmanagerId != undefined) {
		req.body.pmanagerId = typeof req.body.pmanagerId == 'string' ? [req.body.pmanagerId] : req.body.pmanagerId;
	} else {
		req.body.pmanagerId = [];
	}
	if (req.body.Teams) {
		req.body.Teams = typeof req.body.Teams == 'string' ? [req.body.Teams] : req.body.Teams;
	} else {
		req.body.Teams = [];
	}
	req.body.delete = typeof req.body.delete == 'string' ? [req.body.delete] : req.body.delete;
	req.body.add = typeof req.body.add == 'string' ? [req.body.add] : req.body.add;
	console.log("IN UPDATE PROFILE=============>", req.body);
	projectModel
		.findOne({ _id: projectId })
		.exec((error, resp) => {
			if (error) {
				res.status(500).send(err);
			} else if (resp) {
				var uploadPath = path.join(__dirname, "../uploads/" + projectId + "/avatar/");
				console.log("IN UPDATE PROFILE=============>", uploadPath);
				req.file('avatar').upload({
					maxBytes: 50000000000000,
					dirname: uploadPath,
					saveAs: function (__newFileStream, next) {
						dir.files(uploadPath, function (err, files) {
							if (err) {
								mkdir(uploadPath, 0775);
								return next(undefined, __newFileStream.filename);
							} else {
								return next(undefined, __newFileStream.filename);
							}
						});
					}
				}, function (err, files) {
					if (err) {
						console.log(err);
						return (res.status(500).send(err))
					} else {
						console.log(files);
						console.log("files==========>", files)
						var profile = resp.avatar;
						console.log('profile================>', profile);
						if (files.length > 0) {
							profile = files[0].fd.split('/uploads/').reverse()[0];
						}
						req.body['avatar'] = profile;
						console.log("req. body =====+>", req.body);
						projectModel
							.findOneAndUpdate({ _id: projectId }, { $set: req.body }, { upsert: true }, function (error, user) {
								if (error) {
									console.log("=====================================", error)
									return (res.status(500).send(error));
								} else {
									console.log("update==========================================>", user);
									console.log("ADD MEMBER+++++++++++++++++", req.body.add);
									if (req.body.add && req.body.add.length) {
										userModel
											.find({ _id: req.body.add[0] })
											.exec((err, add) => {
												if (err) {
													return (res.status(500).send(err));
												} else {
													console.log("add Team member", add);
													if (!user.Teams.length) {
														var obj = {
															"subject": "New team member added.",
															"content": "Congrates, " + add[0].name + "  you are  added in " + req.body.title + " project as a " + add[0].userRole + ".",
															// "content" : "New Team member added in "+req.body. uniqueId+ " team.",
															"sendTo": req.body.Teams,
															"type": "other",
														}
													} else {
														var obj = {
															"subject": "New team member added.",
															"content": "In " + req.body.title + " project, " + add[0].name + " is added as " + add[0].userRole + ".",
															// "content" : "New Team member added in "+req.body. uniqueId+ " team.",
															"sendTo": req.body.Teams,
															"type": "other",
														}

													}
													var notification = new sendnotificationModel(obj);
													notification.save(function (err, savedNotification) {
														if (err) {
															return (res.status(500).send(err));
														}
														console.log("TEAM============>", req.body.Teams);
														var Teams = req.body.Teams;
														team = [];
														notificationModel
															.find({ userId: Teams }, function (err, foundUser) {
																console.log("TOKEN==================>", foundUser);
																req.session.user = foundUser;
																req.session.userarray = [];
																async.forEach(foundUser, function (item, callback) {
																	console.log("item------>", item)
																	team.push(item.token);
																	console.log("team========>", team);
																	callback();
																});
																pushNotification.postCode(obj.subject, obj.type, team);
															})
													})
												}
											})
									}
									if (req.body.delete && req.body.delete.length) {
										userModel
											.find({ _id: req.body.delete })
											.exec((err, add) => {
												if (err) {
													return (res.status(500).send(err));
												} else {
													console.log("add Team member");
													var obj = {
														"subject": "Team member terminated.",
														"content": "For the notes, " + add[0].name + " is terminated from " + req.body.uniqueId + " team as " + add[0].userRole + ".",
														"sendTo": req.body.Teams,
														"type": "other",
													}
													var notification = new sendnotificationModel(obj);
													notification.save(function (err, savedNotification) {
														if (err) {
															return (res.status(500).send(err));
														}
														console.log("TEAM============>", req.body.Teams);
														var Teams = req.body.Teams;
														team = [];
														notificationModel
															.find({ userId: Teams }, function (err, foundUser) {
																console.log("TOKEN==================>", foundUser);
																req.session.user = foundUser;
																req.session.userarray = [];
																async.forEach(foundUser, function (item, callback) {
																	console.log("item------>", item)
																	team.push(item.token);
																	console.log("team========>", team);
																	callback();
																});
																pushNotification.postCode(obj.subject, obj.type, team);
															})
													})
												}
											})
									}
									return (res.status(200).send(user));
								}
							})
					}
				})
			} else {
				return (res.status(404).json({ msg: 'No project found' }));
			}
		})
}

// projectController.updateProjectById = function(req,res){
// 	// console.log("REQQQQQQ===========>",req.body);
// 	// // console.log("reqqqqqqqfile=================>",req.file);
// 	// console.log("New Team===================================>",req.body.Teams)
// 	// console.log("DELETE=========================================>",req.body.delete);
// 	// // var array = [];
// 	// if (req.body.Teams == null){
// 	// 	req.body.Teams = [];
// 	// }
// 	// console.log("teamLength==========>",req.body.Teams.length);
// 	// var updatedTeam = req.body.Teams.length;
// 	// var projectId = req.params.projectId;
// 	// var deleteTeam = req.body.delete;
// 	// var addTeam = req.body.add;
// 	// console.log("deleteTeam===>",deleteTeam);
// 	// console.log("projectId====>",projectId);
// 	// projectModel.findOneAndUpdate({_id:projectId},{$set:req.body},{upsert:true},function(err,projects){
// 		// if(err){
// 		// 	res.status(500).send(err);
// 		// }else{
// 			var uploadPath = path.join(__dirname, "../uploads/"+projectId+"/avatar/");
// 			console.log("IN UPDATE PROFILE=============>",uploadPath);
// 			req.file('avatar').upload({
// 				maxBytes: 50000000000000,
// 				dirname: uploadPath,
// 				saveAs: function (__newFileStream, next) {
// 					dir.files(uploadPath, function(err, files) {
// 						if (err){
// 							mkdir(uploadPath, 0775);
// 							return next(undefined, __newFileStream.filename);
// 						}else {
// 							return next(undefined, __newFileStream.filename);
// 						}
// 					});
// 				}
// 			}, function(err, files){
// 				if (err) {
// 					console.log(err);
// 					res.status(500).send(err);
// 				}else{
// 					console.log(files);
// 					console.log("files==========>",files)
// 					var profile = req.body.avatar;
// 					console.log('profile================>',profile);
// 					if(files.length>0){
// 						profile = files[0].fd.split('/uploads/').reverse()[0];
// 					}
// 					req.body['avatar'] = profile;
// 					if (!req.body.Teams || req.body.Teams == 'null') {
// 						console.log('inside: ');
// 						delete req.body.Teams;
// 					}
// 					console.log("req. body =====+>" , req.body);

// 			// getuser['profilePhoto'] = profile;
// 			projectModel.findOneAndUpdate({_id: projectId}, {$set: req.body}, {upsert:true ,new: true},function(error,user){
// 				if (error){ 
// 					console.log("=====================================",error)
// 					res.status(500).send(error);
// 				}else{
// 					console.log(user);
// 					// res.status(200).send(user);
// 				// }
// 			// })
// 		// }

// 	// })


// 	console.log("saved console 5",user);	
// 		// console.log("old TEAM=================================================>",user.user);
// 		var teamLength = user.Teams.length;
// 		console.log("teamLength",teamLength);
// 		userDetails = [];
// 		userModel
// 		.find({_id : deleteTeam},function(err,foundUser){
// 			// console.log("name==============>",foundUser[0].name);
// 			async.forEach(foundUser, function (item, callback){ 
// 				console.log("item------>",item)
// 				userDetails.push(item);
// 				console.log("team========>",userDetails);
// 				console.log("name=========================>",userDetails[0].name);
// 				// callback();
// 				projectModel.update(
// 					{},
// 					{ $pull: { Teams: { $in: item._id } } },
// 					{ multi: true }
// 					)
// 				console.log("deleted: ",item._id); 
// 				});

// 			userModel
// 			.find({_id : addTeam})
// 			.exec((err,add)=>{
// 				if(req.body.Teams){
// 					if(teamLength != updatedTeam){
// 						if(teamLength > updatedTeam){
// 							console.log("deleteTeam member");
// 							var obj = {
// 								"subject" :"Team member terminated.",
// 								"content" : "For the notes, "+userDetails[0].name+ " is terminated from "+req.body. uniqueId+ " team as "+userDetails[0].userRole+ ".",
// 					// "content" : "Team member terminated from <strong>"+req.body.uniqueId + "</strong> team.",
// 					"sendTo" : req.body.Teams,
// 					"type" : "other",
// 				} 
// 			}else if(teamLength < updatedTeam){
// 				console.log("add Team member");
// 				var obj = {
// 					"subject" :"New team member added.",
// 					"content" : "For the notes, "+add[0].name+ " is added in "+req.body. uniqueId+ " team as "+add[0].userRole+ ".",
// 					// "content" : "New Team member added in "+req.body. uniqueId+ " team.",
// 					"sendTo" : req.body.Teams,
// 					"type" : "other",
// 				} 
// 			}
// 			var notification = new sendnotificationModel(obj);
// 			notification.save(function(err,savedNotification){
// 				if(err){
// 					res.status(500).send(err);		
// 				}
// 				console.log("TEAM============>",req.body.Teams);
// 				var Teams = req.body.Teams;
// 				team = [];
// 				notificationModel
// 				.find({userId : Teams}, function(err, foundUser){
// 					console.log("TOKEN==================>",foundUser);
// 					req.session.user = foundUser;
// 					req.session.userarray = [];
// 					async.forEach(foundUser, function (item, callback){ 
// 						console.log("item------>",item)
// 						team.push(item.token);
// 						console.log("team========>",team);
// 						callback(); 
// 					});  
// 					pushNotification.postCode(obj.subject,obj.type,team);
// 				})
// 			})
// 		}
// 	}
// })
// 		// })
// 	})
// 		res.status(200).send(user);
// 	}

// })
// 		}
// 	})
// 		}


projectController.getAllProjectOrderByTitle = function (req, res) {
	projectModel.find({})
		.sort({ 'title': -1 })
		.exec(function (err, project) {
			console.log("err==========>>>", err);
			res.send(project);
			console.log(project);
		})
}

projectController.uploadFilesToFolder = function (req, res) {
	console.log(req.body);
	var uploadPath = path.join(__dirname, "../uploads/" + req.body.projectId + "/sharedFile");
	console.log(uploadPath);
	req.file('fileUpload').upload({
		maxBytes: 50000000,
		dirname: uploadPath,
		saveAs: function (__newFileStream, next) {
			dir.files(uploadPath, function (err, files) {
				console.log(err, files)
				if (err) {
					mkdir(uploadPath, 0775);
					return next(undefined, __newFileStream.filename);
				} else {
					return next(undefined, __newFileStream.filename);
				}
			});
		}
	}, function (err, files) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else {
			console.log(files)
			res.status(200).send("files uploaded successfully");
		}
	})
}

projectController.getAllFiles = function (req, res) {
	console.log(req.body)
	dir.files(path.join(__dirname, "../uploads/" + req.body.projectId + "/sharedFile"), function (err, files) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else {
			console.log(files);
			res.status(200).send(files);
		}
	});
}

projectController.deleteFile = function (req, res) {
	var file = req.body.file;
	var fileLocation = path.join(__dirname, "../uploads/" + req.body.projectId, file);
	console.log(fileLocation);
	fs.unlink(fileLocation, (err) => {
		if (err) {
			res.status(500).send("file not deleted");
		}
		res.status(200).send("file deleted");
	});
}
projectController.getDeveloperOfProject = function (req, res) {
	console.log("projectId ========>", req.params.projectId);
	var projectId = req.params.projectId;
	projectModel
		.findOne({ _id: projectId })
		.select('Teams -_id')
		.populate('Teams')
		.exec((err, foundTeam) => {
			if (err) {
				res.send(err)
			} else {
				res.status(200).send(foundTeam);
			}
		})
}


projectController.getTaskOfProject = function (req, res) {
	console.log("projectId ========>", req.params.projectId);
	var projectId = req.params.projectId;
	projectModel
		.findOne({ _id: projectId })
		.select('taskId IssueId BugId tasks')
		.exec((err, foundTeam) => {
			if (err) res.send(err)
			else res.status(200).send(foundTeam);
		})
}

projectController.getProjectByPmanagerId = function (req, res) {
	var pmanagerId = req.params.pmanagerId;
	projectModel
		.find({ pmanagerId: pmanagerId })
		.select('projects Teams')
		.exec((err, found) => {
			if (err) res.send(err);
			else {
				res.send(found);
			}
		})
}



projectController.changeAvatarByProjectId = function (req, res) {
	console.log("userId is==============>", req.file('avatar'));
	var projectId = req.params.id
	var uploadPath = path.join(__dirname, "../uploads/" + projectId + "/avatar/");
	console.log("IN UPDATE PROFILE=============>", uploadPath);
	req.file('avatar').upload({
		maxBytes: 50000000000000,
		dirname: uploadPath,
		saveAs: function (__newFileStream, next) {
			dir.files(uploadPath, function (err, files) {
				if (err) {
					mkdir(uploadPath, 0775);
					return next(undefined, __newFileStream.filename);
				} else {
					return next(undefined, __newFileStream.filename);
				}
			});
		}
	}, function (err, files) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else {
			console.log(files);
			console.log("files==========>", files)

			var profile = files[0].fd.split('/uploads/').reverse()[0];
			// getuser['profilePhoto'] = profile;
			projectModel.findOneAndUpdate({ _id: projectId }, { $set: { avatar: profile } }, { upsert: true, new: true }).exec((error, user) => {
				if (error) {
					res.status(500).send(error);
				} else {
					console.log(user);
					res.status(200).send(user);
				}
			})
		}

	})

}

module.exports = projectController;