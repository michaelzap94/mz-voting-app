var mongoose = require("mongoose");

var userBioSchema = new mongoose.Schema({
   name: String,
   surname: String
});
var UserBio = mongoose.model("UserBio", userBioSchema);


var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    details:[userBioSchema],
    resetPasswordToken:Number
});
/////////////////////////////////////////IMPORTANT
var passportLocalMongoose = require("passport-local-mongoose");
UserSchema.plugin(passportLocalMongoose);
///////////////////////////////////////////////////////

module.exports = mongoose.model("User",UserSchema);