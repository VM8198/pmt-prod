var timeLogModel = require('../model/timeLog.model');
var taskModel = require('../model/tasks.model');
let timeLogController = {};

timeLogController.addTimeLog = function(req,res){
	console.log("rewq . body ==>" , req.body);
	var currentTask;
	var updatedTask;
	var count;
	var previousDifference = 0;
	var difference = 0 ;
	var diff;
	var obj = {
		"count":req.body.timelog1.count
	}
	var newCount;
	var abc;
	console.log(" obj ==========================>",obj);
	var counter = new timeLogModel(obj);
	
	counter.save(function(err,count){
		console.log('count============>',count);
		newCount = count;
		console.log('newCount===============>',newCount.count);
		abc = newCount.count;
		console.log('abc===========================>',abc)
		taskModel.find({uniqueId:req.body.uniqueId},function(err,foundTask){
			console.log("foundemppppppppppppp",foundTask);
			if(err){
				console.log("task not found")
			}
			if(foundTask){
				console.log("found task ============+>" , foundTask);
				currentTask = foundTask[0]._id;
				console.log('curruntTask',currentTask);
				console.log(new Date().toLocaleTimeString());
				timeLogModel.findOne({taskId:currentTask},function(err , updatedTask){	
					console.log("updated task ====================>" , updatedTask);	
					// console.log("updated task difference ====================>" , updatedTask.difference);
					if(updatedTask != null){
						count = updatedTask.log.length - 1;
						console.log("value of count in updatedtask != null" , count);
						if(updatedTask.log[count].startTime == null){
							updatedTask.log[count].startTime = new Date();
							updatedTask.count= abc;
							updatedTask.save(function(err , updated){
								if(err) res.send(err);
								res.send(updated);
								console.log('updated==============>',updated);
							})
						}else if(updatedTask.log[count].endTime == null){
							console.log("worked ========+>");
							updatedTask.log[count].endTime = new Date();
							console.log('endtimeeeeeeeeeeeee===========>',updatedTask.log[count].endTime);
							previousDifference = updatedTask.log[count].endTime - updatedTask.log[count].startTime; 
							console.log('previousDifference',previousDifference);
							updatedTask.difference = +previousDifference + +updatedTask.difference;
							updatedTask.count = abc;
							console.log('updatedTask.counter============>',updatedTask.count);
							console.log('updatedTask.difference difffff================>',updatedTask.difference);
							updatedTask.save(function(err, upSt){
								// timeLogModel.findOneAndUpdate({_id:updatedTask._id},)
								if (err) res.send(err);
								console.log("updatedTask != null");
								console.log('upSt======================<',upSt);
								res.send(upSt);
							})
						}else{
							updatedTask.log.push({startTime: new Date()});
							updatedTask.count= abc;
							updatedTask.save(function(err , updated){
								if(err) res.send(err);
								res.send(updated);
								console.log('updated==============>',updated);
							})
						}

					}

					else{	
						console.log( "updatedTask == null")
						console.log(new Date().toLocaleTimeString());
						console.log("else");
						var date = new Date();
						var obj = {
							
							taskId: currentTask,
							log: [{
								startTime: new Date(),
							}]
						}
						
						console.log("obj ================>" , obj);
						console.log("obj.count" , obj);
						var timelog = new timeLogModel(obj);
						console.log("timelog ===================>" , timelog);
						timelog.save(function(err,savedTimeLog){
							console.log("saved._id" , savedTimeLog.taskId);
							taskModel.findOne({_id: savedTimeLog.taskId})
							.exec((err , foundTask)=>{
								console.log("foundTask ==>" , foundTask);
								 foundTask.timelog1 = savedTimeLog._id;
								 console.log("found tSSAsas ==============================>" , foundTask);

								taskModel.findOneAndUpdate({_id: savedTimeLog.taskId} , foundTask, {upsert: true , new: true ,  useFindAndModify: false})
								.exec((err , savedTask)=>{
									console.log("savedTask =====>" , savedTask);
									res.send(savedTask);
								})
							})
						})
					}
				})
			}
		})

	})

}
	// // taskModel.findOne({_id:req.params.id}).exec((err, taskFound)=>{
	// // 	if(err){
	// // 		res.status(500).send(err);
	// // 	}
	// // else if(taskFound){
	// // 		console.log('taskfound==========>',taskFound);
	// req.body = {
	// 	log: [{
	// 		startTime: Date.now()
	// 	}
	// 	]
	// }
	// var timeLogData = new timeLogModel(req.body);
	// timeLogData.save(function(err,timelog){
	// 	console.log("time log ====>" , timelog);
	// 	res.send(timelog);		
	// 	if(err){
	// 		console.log("shdfgshfyrtfyetgretghhhhhhbjh")
	// 		res.status(500).send(err);
	// 	}else if(timelog){
	// 		console.log('timelog',timelog);
	// 		var outerLen = timelog.log.length;
	// 		console.log("lengths",outerLen);
	// 		// if(new Date(timelog.log[outerLen-1].date).toDateString() == new Date().toDateString()){
	// 			// console.log(new Date().toDateString());
	// 			if(timelog.log[outerLen-1].endTime == null ){

	// 				timelog.endTime=Date.now();
	// 				console.log('timeLogController',timelog.endTime);

	// 				var difference = timelog.log[outerLen-1].endTime.getTime() - timelog.log[outerLen-1].startTime.getTime();

	// 				timelog.difference = difference;

	// 				timelog.save((errr,attends)=>{
	// 					if(errr){
	// 						console.log("jhfgdyduftrutfryug")
	// 						res.status(500).send(errr);
	// 					}else{
	// 						console.log("dhsfgd")
	// 						res.status(200).send(attends);
	// 					}

	// 				})
	// 			}else{
	// 				var data = {
	// 					log:[{startTime:Date.now(),endTime:null}]
	// 				}

	// 				var att = new timeLogModel(data);

	// 				att.save((error,attendance)=>{

	// 					if(error){
	// 						console.log("gsdfhsfg")
	// 						res.status(500).send(error);
	// 					}else{
	// 						console.log("res",attendance)
	// 						res.status(200).send(attendance);
	// 					}
	// 				})
	// 			}


	// 		}

	// 	})	


	module.exports = timeLogController;






