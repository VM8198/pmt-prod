var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: String,
    userRole: {type:String, default: 'user'},
    email: {
        type: String,
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Please fill valid email address`],
    },
    password: String,
    joiningDate: Date,
    phone: String,
    experience:String,
    profilePhoto: String,
    CV: String,
    projects:[{type:Schema.Types.ObjectId, ref: 'Project'}],
    tasks: [{type: Schema.Types.ObjectId , ref: 'Tasks'}],
    isDelete : Boolean,
    
},{timestamps: true});



UserSchema.pre('save', function(next) {
    var user = this;
    console.log("Im Model=====================>", user);
    // if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            console.log(hash);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(userPassword, password, cb) {
    bcrypt.compare(userPassword, password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('User',UserSchema);



    // .exec(function(err,projects){
    //     if (err) {
    //         res.status(500).send(err);
    //     }else if(projects){

    //         _.map([...projects.taskId, ...projects.IssueId, ...projects.BugId], function(ele){
    //             if(ele.assignTo == null){
    //                 ele.assignTo = "";
    //             }
    //         })

    //         res.status(200).send(projects);
    //     }else{
    //         res.status(404).send("NOT FOUND");
    //     }
    // })
