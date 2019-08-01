var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var projectModel = require('./project.model');
var BugSchema = new Schema({

	title: { type: String, required: true },
	desc: { type: String },
	attachment:{ type: String },
	assignTo:{ type: Schema.Types.ObjectId, ref: 'User'},
	projectId:{ type: Schema.Types.ObjectId, ref: 'Project'},	
	status:{ type: String, default: "to do" },
	comment:[{ type: Schema.Types.ObjectId, ref: 'Comment'}],
	priority:{ type: String , default: "low"},
	uniqueId:{ type: String },
	timelog:[{
		operation: {type: String},
		dateTime: {type: Date},
		operatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
		_id: false
	}],
	createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
	startDate:{ type: Date },
	dueDate:{ type: Date }

},{timestamps: true});

let BugCounter=1;

BugSchema.pre('save', function(next) {	
	this.uniqueId = 'BUG-'+BugCounter;
	BugCounter++; 
	next();
});

BugSchema.pre('find', function(next) {	
	this.populate('projectId');
	this.populate('createdBy');
	next();
});


module.exports = mongoose.model('Bug', BugSchema);