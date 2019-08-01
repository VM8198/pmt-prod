
var tasksModel = require('../model/tasks.model');
var projectModel = require('../model/project.model');
var userModel = require('../model/user.model');
var notificationModel = require('../model/notification.model');
var sendnotificationModel = require('../model/sendNotification.model');
var sprintModel = require('../model/sprint.model');
var _ = require('lodash');
let tasksController = {};
var dir = require('node-dir');
var mkdir = require('mkdirp');
var path = require('path');
var fs = require('fs');
var nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

var pushNotification = require('./../service/push-notification.service');
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
var uniqueId;

tasksController.addTasks = function (req, res) {
	console.log("req.body", req.body);
	var uploadPath = path.join(__dirname, "../uploads/" + req.body.projectId + "/");
	console.log(uploadPath);
	req.file('fileUpload').upload({
		maxBytes: 50000000000000,
		dirname: uploadPath,
		saveAs: function (__newFileStream, next) {

			dir.files(uploadPath, function (err, files) {
				if (err) {
					mkdir(uploadPath, 0775);
					return next(undefined, __newFileStream.filename);
				}
				else {
					return next(undefined, __newFileStream.filename);
				}
			});
		}
	}, function (err, files) {
		if (err) {
			console.log(err);
			return (res.status(415).send(err));
		}
		else {
			console.log(files)
			var fileNames = [];
			if (files.length > 0) {
				_.forEach(files, (gotFile) => {
					fileNames.push(gotFile.fd.split('/uploads/').reverse()[0])
				})
			}

			tasksModel
				.find({ projectId: req.body.projectId })
				.populate('createdBy ')
				.sort({ "_id": -1 })
				.limit(1)
				.exec((err, foundTask) => {
					if (err) {
						console.log(err);
						return (res.status(404).send(err));
					}
					else if (foundTask && foundTask.length == 1) {
						var projectId = foundTask[0].projectId;

						foundTask = foundTask[0].uniqueId.split("-");
						var count = +foundTask[1] + +1;
						console.log("found Task ====>", +foundTask[1] + +1);
						req.body['uniqueId'] = foundTask[0] + "-" + count;
						req.body['startDate'] = Date.now();
						if (req.body.dueDate == 'undefined')
							delete req.body['dueDate'];
						console.log("req.body ====>", req.body);
						var saveTask = new tasksModel(req.body);
						saveTask['images'] = fileNames;
						saveTask.save((err, savedTask) => {
							console.log(err, savedTask);
							if (err) res.status(500).send(err);
							projectModel.findOne({ _id: savedTask.projectId })
								.exec((err, resp) => {
									console.log("resp=============================================================>", resp);
									resp.tasks.push(savedTask._id);
									var flag = 5;
									var final = 1
									var q = JSON.stringify(savedTask.assignTo);
									for (var i = 0; i < resp.Teams.length; i++) {
										var p = JSON.stringify(resp.Teams[i]);
										flag = p.localeCompare(q);
										console.log("flag ===>", flag);
										if (flag == 0) {
											final = 0;
										}
									}
									if (final == 1) {
										resp.Teams.push(savedTask.assignTo);
									}
									resp.save();
									if (savedTask.assignTo) {
										userModel.findOne({ _id: savedTask.assignTo._id })
											.exec((err, foundedUser) => {
												foundedUser.tasks.push(savedTask._id);
												foundedUser.save();
												console.log("resp1 receive");

												var priority1 = req.body.priority;

												var color = req.body.color;
												var color;
												if (priority1 == '1') {
													prior = "Highest";
													color = "#ff0000";
												}
												else if (priority1 == '2') {
													prior = "High";
													color = "#ff8100";
												}
												else if (priority1 == '3') {
													color = "#cabb08";
													prior = "Medium";
												}
												else {
													color = "#0087ff";
													prior = "Low";
												}
												tasksModel.findOne({ _id: savedTask._id })
													.populate('assignTo projectId createdBy')
													.exec((err, foundTask) => {
														var name = foundTask.assignTo.name;
														console.log("name of assign usersssssss>>>>><<<<<<<", name);
														var email = foundTask.assignTo.email;
														var sprint = foundTask.sprint;

														sprintModel
															.find({ _id: sprint })
															.exec((err, sprint) => {
																console.log("sprint============>", sprint);
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
											<p style="margin: 0px;color: #181123;padding:13px; font-size: 16px;"><b>` + foundTask.createdBy.name + ` assign a task: </b><b style="color:#bf4444;">` + req.body.title + `</b> in <b>` + foundTask.projectId.title + `.</b></p>

											<div style="margin:15px;">
											
											<p style=" color: #181123; font-size: 16px;"><b>Sprint:</b>
											<span style="color: #2b1252; font-size:16px;">` + sprint[0].title + `</span></p>

											<p style=" color: #181123; font-size: 16px;"><b>Due date:</b>
											<span style="color: #2b1252; font-size:16px;">`+ req.body.dueDate + `</span></p>

											<p style=" color: #181123; font-size: 16px;"><b>Priority:</b>
											<span style="color: #2b1252; font-size:16px;">`+ prior + `</span></p>
											
											<p style=" color: #181123; font-size: 16px;"><b>Estimated time:</b>
											<span style="color: #2b1252; font-size:16px;">`+ foundTask.estimatedTime + `</span></p>
											
											<p style="color: #181123; font-size: 16px;"><b>Description:</b>
											<span style="color: #2b1252; font-size:16px; width: 100%;height: 100%;margin: 0;padding: 0;overflow: auto;">`+ req.body.desc + `</span></p>
											
											</div>

											<div style="border-bottom:1px solid #ccc;margin:5px 0 10px;height:1px"></div><div class="m_-7949690059544268696content" style="font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;color:#444;line-height:1.6em;font-size:15px"><center><a href="http://localhost:4200/#/project-details/` + foundTask.projectId._id + `"><button style="background-color: #3998c5;border: none;color: white;padding: 10px 25px;text-align: center;text-decoration: none;display: inline-block;border-radius: 4px;margin-bottom: 20px;font-size: 16px;cursor: pointer;">View Item</button></a></center></div>
											</div>
											</div>
											</body>
											</html>`;
																var mailOptions = {
																	from: 'raoinfotechp@gmail.com',
																	to: email,
																	subject: 'For New Task',
																	text: 'Hi, this is a testing email from node server',
																	html: output
																};

																transporter.sendMail(mailOptions, function (error, info) {
																	if (error) {
																		console.log("Error", error);
																	}
																	else {
																		console.log('Email sent: ' + info.response);
																	}
																});
															})
														var obj = {
															"subject": " You have been assigned a new task", "content": "A new task in <strong>" + foundTask.projectId.title + " </strong> is been created by " + foundTask.createdBy.name + " and assigned to you.",
															"sendTo": foundTask.assignTo._id, "type": "task", "priority": foundTask.priority, "projectId": projectId,
															"createdAt": foundTask.createdAt,
														}
														console.log("obj==================>", obj);

														var notification = new sendnotificationModel(obj);
														notification.save(function (err, savedNotification) {
															if (err) {
																res.status(500).send(err);
															}
															var assignTo = foundTask.assignTo._id;
															notificationModel
																.findOne({ userId: assignTo })
																.exec((err, user) => {
																	if (err)
																		if (user == null) return (res.status(404).send({ msg: "token not generated" }));
																		else res.status(400).send(err);
																	else
																		if (user == null) return (res.status(200).send(foundTask));
																		else
																			if (user && user.token)
																				pushNotification.postCode(obj.subject, obj.type, [user.token]);
																	return (res.status(200).send(foundTask));
																})
														})
													})
											})

									}
								})

						})
					} else {
						projectModel.find({ _id: req.body.projectId })
							.exec((err, foundProject) => {
								if (err) {
									console.log(err);
									return res.status(404).send(err);
								}
								console.log("found project", foundProject);
								foundProject = foundProject[0].uniqueId.split("-");
								var txt = foundProject[0];
								req.body['uniqueId'] = txt + "-" + 1;
								req.body['startDate'] = Date.now();
								console.log("first task of the project =====>", req.body);
								var saveTask = new tasksModel(req.body);
								saveTask['images'] = fileNames;
								console.log(saveTask);
								saveTask.save().then((savedTask) => {
									console.log("savd Tsk ===> ", savedTask);
									projectModel.findOne({ _id: savedTask.projectId })
										.exec((err, resp) => {
											if (err) {
												console.log(err);
												return res.status(404).send(err);
											}
											resp.tasks.push(savedTask._id);
											var flag = 5;
											var final = 1
											var q = JSON.stringify(savedTask.assignTo);
											console.log("type of ==>", typeof q);
											for (var i = 0; i < resp.Teams.length; i++) {
												var p = JSON.stringify(resp.Teams[i]);
												flag = p.localeCompare(q);
												console.log("flag ===>", flag);
												if (flag == 0) {
													final = 0;
												}
											}
											console.log("final ===>", final);
											if (final == 1) {
												resp.Teams.push(savedTask.assignTo);
												console.log("resp received");
											}
											resp.save();
											console.log("final task======>235", savedTask);
											var priority1 = req.body.priority;
											var color = req.body.color;
											if (priority1 == '1') {
												prior = "Highest";
												color = "#ff0000";
											}
											else if (priority1 == '2') {
												prior = "High";
												color = "#ff8100";
											}
											else if (priority1 == '3') {
												color = "#ffee21";
												prior = "Medium";
											}
											else {
												color = "#0087ff";
												prior = "Low";
											}
											tasksModel.find({ _id: savedTask._id })
												.populate('name projectId createdBy assignTo')
												.exec((err, foundTask) => {
													if (err) {
														console.log(err);
														return res.status(404).send(err);
													}
													console.log("found task===============>", foundTask);
													var email = foundTask[0].assignTo.email;
													var sprint = foundTask[0].sprint;
													var name = foundTask[0].assignTo.name;
													sprintModel
														.find({ _id: sprint })
														.exec((err, sprint) => {
															if (err) {
																console.log(err);
																return res.status(404).send(err);
															}
															console.log("sprint details line 268", sprint);
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
						<p style="margin: 0px;color: #181123;padding:13px; font-size: 16px;"><b>` + foundTask[0].createdBy.name + ` assign a task: </b><b style="color:#bf4444;">` + req.body.title + `</b> in <b>` + foundTask[0].projectId.title + `.</b></p>

						<div style="margin:15px;">

						<p style=" color: #181123; font-size: 16px;"><b>Sprint:</b>
						<span style="color: #2b1252; font-size:16px;">` + sprint[0].title + `</span></p>

						<p style=" color: #181123; font-size: 16px;"><b>Due date:</b>
						<span style="color: #2b1252; font-size:16px;">`+ req.body.dueDate + `</span></p>

						<p style=" color: #181123; font-size: 16px;"><b>Priority:</b>
						<span style="color: #2b1252; font-size:16px;">`+ prior + `</span></p>

						<p style=" color: #181123; font-size: 16px;"><b>Estimated time:</b>
						<span style="color: #2b1252; font-size:16px;">`+ foundTask[0].estimatedTime + `</span></p>

						<p style="color: #181123; font-size: 16px;"><b>Description:</b>
						<span style="color: #2b1252; font-size:16px; width: 100%;height: 100%;margin: 0;padding: 0;overflow: auto;">`+ req.body.desc + `</span></p>

						</div>

						<div style="border-bottom:1px solid #ccc;margin:5px 0 10px;height:1px"></div><div class="m_-7949690059544268696content" style="font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;color:#444;line-height:1.6em;font-size:15px"><center><a href="http://localhost:4200/#/project-details/` + sprint.projectId + `"><button style="background-color: #3998c5;border: none;color: white;padding: 10px 25px;text-align: center;text-decoration: none;display: inline-block;border-radius: 4px;margin-bottom: 20px;font-size: 16px;cursor: pointer;">View Item</button></a></center></div>
						</div>
						</div>
						</body>
						</html>`;
															var mailOptions = {
																from: 'raoinfotechp@gmail.com',
																to: email,
																subject: 'For new task',
																text: 'Hi, this is a testing email from node server',
																html: output
															};

															transporter.sendMail(mailOptions, function (error, info) {
																if (error) {
																	console.log("Error", error);
																}
																else {
																	console.log('Email sent: ' + info.response);
																}
															});
															var obj = {
																"subject": " You have been assigned a new task", "content": "A new task in " + foundTask[0].projectId.title + " project is been created by " + foundTask[0].createdBy.name + " and assigned to you.",
																"sendTo": foundTask[0].assignTo._id, "type": "task", "priority": foundTask[0].priority, "createdAt": foundTask[0].createdAt,
															}
															console.log("obj==================>", obj);
															var notification = new sendnotificationModel(obj);
															notification.save(function (err, savedNotification) {
																if (err) {
																	return (res.status(406).send(err));
																}
																var assignTo = foundTask[0].assignTo._id;
																notificationModel
																	.findOne({ userId: assignTo })
																	.exec((err, user) => {
																		if (err) {
																			return (res.status(404).send(err));
																		}
																		else {
																			if (user == null) {
																				return (res.status(200).send(savedTask));
																			}
																			else {
																				if (user && user.token)
																					pushNotification.postCode(obj.subject, obj.type, [user.token]);
																				return (res.status(200).send(savedTask));
																			}
																		}
																	})
															})
														});
												})
										});
								})
							})

					}
				})
		}
	})
}

tasksController.getTaskByProjectId = function (req, res) {
	console.log("req.parasm :", req.params);
	var projectId = req.params.taskId;
	tasksModel.find({ projectId: projectId })

		.populate('assignTo createdBy timelog1 sprint')

		.exec((err, foundTask) => {
			if (err) return (res.status(500).send(err));
			else return (res.status(200).send(foundTask));
		})
}
tasksController.updateTaskById = function (req, res) {
	var userId;
	var taskId = req.params.taskId;
	var lastTask = false;
	console.log("taskId ======+>", taskId);
	console.log("req. body =====+>", req.body);
	req.body.images = req.body.images ? req.body.images.split(',') : [];
	console.log("req. body =====+>", req.body);
	var uploadPath = path.join(__dirname, "../uploads/" + req.body.projectId + "/");
	console.log(uploadPath);
	req.file('fileUpload').upload({
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
			return (res.status(415).send(err));
		} else {
			console.log("files of updated task", files);
			tasksModel.findOne({ _id: taskId }, function (err, task) {

				var fileNames = req.body.images;
				if (files.length > 0) {
					_.forEach(files, (gotFile) => {
						fileNames.push(gotFile.fd.split('/uploads/').reverse()[0])
					})
				}
				console.log(fileNames);
				req.body['images'] = fileNames;
				console.log("req. body =====+>", req.body);
				tasksModel.findOneAndUpdate({ _id: taskId }, req.body, { upsert: true, new: true }, function (err, updatedData) {
					if (err) return (res.send("err"));
					else {
						projectModel.findOne({ _id: updatedData.projectId })
							.exec((err, resp) => {
								var flag = 5;
								var final = 1
								var q = JSON.stringify(updatedData.assignTo);
								console.log("type of ==>", typeof q);
								for (var i = 0; i < resp.Teams.length; i++) {
									var p = JSON.stringify(resp.Teams[i]);
									flag = p.localeCompare(q);
									console.log("flag ===>", flag);
									if (flag == 0) {
										final = 0;
									}
								}
								console.log("final ===>", final);
								if (final == 1) {
									resp.Teams.push(updatedData.assignTo);
								}
								resp.save();

								console.log("final task======>388", updatedData);
								userModel.findOne({ _id: updatedData.assignTo })
									.exec((err, user) => {
										user.tasks.push(updatedData._id);
										user.save();
										console.log("final task======>393", updatedData);
										return (res.status(200).send(updatedData));
									})
							})
					}
				})
			})
		}
	});
}
tasksController.getAllTask = function (req, res) {
	tasksModel
		.find({})
		.populate('projectId assignTo createdBy timelog1 sprint')
		.exec((err, allTasks) => {
			if (err) return (res.send('err'));
			else return (res.send(allTasks));
		})
}
tasksController.updateTaskStatusById = function (req, res) {
	var taskId = req.body._id;
	if (req.body.status !== 'complete') {
		tasksModel.findOne({ _id: taskId }).exec((err, task) => {
			if (err) return (res.status(500).send(err));
			else if (task) {
				var timelog = task.timelog;
				timelog.push({
					operation: "shifted to " + req.body.status + " from " + task.status,
					dateTime: Date.now(),
					operatedBy: req.body.operatorId
				})
				tasksModel.findOneAndUpdate({ _id: taskId }, { $set: { status: req.body.status, timelog: timelog, startDate: req.body.status == 'in progress' ? Date.now() : '' } }, { upsert: true, new: true }, function (err, Updatedtask) {
					if (err) return (res.status(500).send(err));
					else if (Updatedtask) return (res.status(200).send(Updatedtask));
					else return (res.status(404).send("Not Found"));
				})
			}
			else return (res.status(404).send("Not Found"));
		})
	}
	else {
		return (res.status(403).send("Bad Request"));
	}
}
tasksController.updateTaskStatusCompleted = function (req, res) {
	console.log("hey it works");
	var taskId = req.body._id;
	console.log("req . body of complete ======>", req.body);
	if (req.body.status === 'complete') {
		tasksModel.findOne({ _id: taskId }).exec((err, task) => {
			if (err) return (res.status(500).send(err));
			else if (task) {
				tasksModel.findOneAndUpdate({ _id: taskId }, { $set: { status: req.body.status, completedAt: Date.now() } }, { upsert: true, new: true }, function (err, Updatedtask) {
					if (err) return (res.status(500).send(err));
					else if (Updatedtask) res.status(200).send(Updatedtask);
					else return (res.status(404).send("Not Found"));
				})
			}
			else return (res.status(404).send("Not Found"));
		})
	} else {
		res.status(403).send("Bad Request");
	}
}
tasksController.deleteTaskById = function (req, res) {
	taskId = req.params.taskId;
	console.log("taskID =====> ", taskId);
	tasksModel.deleteOne({ _id: taskId }, function (err, removed) {
		if (err) return (res.send(err));
		else return (res.status(200).send(removed));
	});
}
module.exports = tasksController;

