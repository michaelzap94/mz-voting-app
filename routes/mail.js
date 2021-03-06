var nodemailer = require('nodemailer');
var express = require("express");
var router = express.Router();
var smtpTransport = require('nodemailer-smtp-transport');
var User = require("../schemas/user");


function saveToken(id,fn){
    User.findById(id,function(err,dateRet){
        if(err){
            console.log("error at finding user savetoken"+err);
        }else{
            console.log("dateRet"+dateRet);
            if(dateRet.resetPasswordToken){
                fn(dateRet.resetPasswordToken);
            }
            else{
                var token = Math.round(Math.random() * 1000000);
                fn(token);
                dateRet.resetPasswordToken = token;
                dateRet.save();
                 
            }
        }
    });
  
}


function handleEmail(req, res,username,id) {
    // Not the movie transporter!
    saveToken(id,function(token){
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL, // Your email id
            pass: process.env.EPASSWORD// Your password
        }
    });
      var link="http://"+req.get('host')+"/newPassword?"+"id="+id+"&token="+token;

   var text = 'Hello world from';
   var mailOptions = {
    from: {
    name: 'mz-voting-app',
    address: process.env.EMAIL}, // sender address
        to : username,
  subject : "Please click on the following link to change your password",
        html : "<h1>Hello from mz-voting-app,</h1><br><p>Please Click on the link to change your password.</p><br><a href="+link+">Click here to change your password</a>" 
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        req.flash("error","Email could not be sent. Please try again later.")
        res.redirect("/");    }else{
        console.log('Message sent: ' + info.response);
        req.flash("success","Email sent successfully. Please check your email.")
        res.redirect("/");
    };
});
      
      
    });

    
}



module.exports = handleEmail;