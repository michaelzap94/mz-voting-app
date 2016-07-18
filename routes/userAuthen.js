var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../schemas/user");
var LocalStrategy = require("passport-local");
var mail = require("./mail")


router.get("/register",function(req,res){
    res.render("registerForm");
});

router.post("/register",function(req,res){
    
     var newUser = new User({username:req.body.username});
     newUser.details.push({
    name: req.body.name,
    surname: req.body.surname
    });
   
   User.register(newUser,req.body.password,function(err,dataRetUser){
       if(err){
           
           req.flash("error",err.message);//err is from "passport package"
                  return res.redirect("back");
    }
       
       else{
           passport.authenticate("local")(req,res,function(){
              req.flash("success","successfully registered " +dataRetUser.details[0].name);
              console.log("successfully registered "+dataRetUser);

               res.redirect("/"); //from there redirect to dashboard
           });
       }
       
       
   });
    
});

//SHOW LOGIN FORM

//middleware: some code that runs before our final callback
router.post("/login", passport.authenticate("local", {
    successRedirect: "/", // "/" will redirect you to dashboard if success
    failureRedirect: "/",
     failureFlash : true // allow flash messages

}) ,function(req, res){

});
//LOGOUT
router.get("/logout", function(req, res){
    
    //LOGOUT("passport package")
    req.logout();//passport destroys all user data in the session.(this comes with "passport package")
    req.flash("success","Logged you out");
    
    res.redirect("/");
});

//logged in user
router.get("/newPassword/:id",isLoggedIn,function(req,res){
    var id = req.params.id;
    
    User.findById(id,function(err, userFound) {
        if(err){
            req.flash("error","Something went wrong, try again later.")
        }
        else{
            res.render("newPasswordForm",{userPassId:userFound._id});
        }
    });
    
    
});

//new password Form;
router.get("/newPassword",function(req,res){
    var token = req.query.token;
    var id = req.query.id;
 
    if(id.length>0){
    User.findById(id,function(err, userFound) {
        if(err){
            res.send("Something went wrong, try again later.")
        }
        else{
            if(userFound.resetPasswordToken===parseInt(token)){
            res.render("newPasswordForm",{userPassId:userFound._id});
        } else{
            res.send("The token has expired. \n\n Please, request a new Password Again and try the new link that will be sent to your email");
        }
            
        }
    });
    }
    else{
       res.send("You need to have a token to access this link, try getting a token first.")
    }
    
});

router.post("/newPassword/email",function(req,res){
    User.find({username:req.body.username},function(err, userArr){
       if(err){
           console.log("error at post email find id"+userRet);
       } 
       else{
           var userRet = userArr[0];
           mail(req,res, userRet.username, userRet._id);
       }
    });
    
});


//new Password set up.
router.put("/newPassword/:id",function(req,res){
    var id = req.params.id;

    User.findById(id,function(err, userFound) {
      if(err){
       req.flash("error","Password was not updated.")
       console.log(err);
        }
      else{
          userFound.setPassword(req.body.password,function(){
              userFound.save();
              
               req.flash("success","Password updated successfully.")
        res.redirect("/");
          });
       
      }
    });
    
    
});

//CHECK IF USER IS LOGGED IN, USING THIS function middleware in the "/secret" route.
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){ //comes with "passport package"
    
      return next();

    }
    else{
        res.redirect("/");
    }
}
//////////////

module.exports = router;