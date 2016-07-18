var mongoose = require("mongoose");

var optionSchema = new mongoose.Schema({
   value: {type:Number, default: 0},
   label: String,
   color: String
    
});
var Option = mongoose.model("Option", optionSchema);

var pollsSchema = new mongoose.Schema({
   title: String,
   description: String,
   author: {
         id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
         name:String,
        surname:String
       
    }, optionsArray: [optionSchema],
    voters: [{
         id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
         ipAddress:String
       
    }]
});

module.exports = mongoose.model("Poll", pollsSchema);