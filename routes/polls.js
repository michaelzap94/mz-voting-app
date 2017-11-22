var express = require("express");
var router = express.Router({mergeParams: true});//parameters in routes cannot be read if specified outside this file unless you merge params.
var passport = require("passport");
var User = require("../schemas/user");
var Poll = require("../schemas/pollsSchema");
var cookieParser = require('cookie-parser');

var optionsCookie = {
    maxAge: 1000 * 60 * 1500000, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
}

    

//GET ALL POLLS
router.get("/allpolls",function(req,res){
    Poll.find({}, function(err, pollsRet){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
          res.render("allPolls",{pollsRet:pollsRet});
        }
    });

});

//-----POLLS OF USER AUTHENTICATED

//GET dashboard /dashboard FORM
router.get("/dashboard",isLoggedIn,function(req,res){
var query = {"author.id":req.user._id};

     Poll.find(query).exec(function(err, userPollsRet){
       if(err){
           console.log(err);
       } else {
          // console.log(userPollsRet);
          res.render("dashboard",{userPollsRet:userPollsRet});
       }
    }); 
    
    
});
//COLOR FUNCTIONS
   var randomNumber = function () {
        var rgbArray = [];
        for (var i = 0; i < 3; i++) {
            var x = Math.random(); //random number
            x = 255 * x; //if we want "say" a random number 0-255
            x = Math.round(x);//////  rounds a number;
            rgbArray.push(x);
        }

        return rgbArray;
    };

    var randomColor = function () {
        var rgbArrayRandomGenerator = randomNumber();

        var rgbColor = "rgb(" + rgbArrayRandomGenerator[0] + ", " + rgbArrayRandomGenerator[1] + ", " + rgbArrayRandomGenerator[2] + ")";

        return rgbColor;
    };

//GET dashboard /dashboard/new FORM
router.get("/dashboard/new",isLoggedIn,function(req,res){
   res.render("newPollForm"); 
});
//POST from newPollForm to /dashboard

function createPollWithOptions(req,res,next){
    var ArrayWithEmptyFields = req.body.option;
    
        var optionsArray = ArrayWithEmptyFields.filter(function(val) {
  return val !== "";
});
    
      var author = {id:req.user._id, username:req.user.username, name:req.user.details[0].name, surname:req.user.details[0].surname};
    
    // get data from form and add to campgrounds array
    var title = req.body.title;
    var desc = req.body.description;
    var newPoll = {title: title, description: desc, author: author};
    
   var createPoll = new Poll(newPoll);
   
   optionsArray.forEach(function(element){
                        var obj ={
                            label:element,
                            color: randomColor()
                        }
                    
                                    createPoll.optionsArray.push(obj);
                 });
                 
    req.createPoll = createPoll;
    next();
                 
}
router.post("/dashboard",isLoggedIn,createPollWithOptions,function(req,res){

   req.createPoll.save(function(err,dataRet){
       req.flash("success","successfully added");
       console.log("dataReturn f d s :"+dataRet);
       res.redirect("/dashboard");
   });
     

});

//DELETE USER OWN POST, need to authorize
router.delete("/dashboard/:id",isLoggedIn,function(req,res){
    Poll.findByIdAndRemove(req.params.id,function(err,pollDeleted){
         if(err){
                        console.log("ERROR deleting id: "+req.params.comment_id);

                        res.redirect("back");

        }
        else{
            console.log("success deleting id: "+req.params.comment_id+" DELETED DATA:  "+pollDeleted);
             req.flash("success","successfully deleted");

            res.redirect("/dashboard");
        }
        
    });
});

//--------------------------------------

//SHOW SPECIFIC POLL :id

router.get("/dashboard/:id",function(req,res){
     Poll.findById(req.params.id).populate("optionsArray").exec(function(err, showOnePoll){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            //render show template with that campground
            
            console.log("show one poll"+showOnePoll);
            res.render("showPoll", {showOnePoll: showOnePoll});
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
function oneVote(req,res,next){

        if(req.cookies.voted!=undefined){
               req.flash("error","You have already voted Homito(a).");
               res.redirect("back");
        }else{
            Poll.findById(req.params.id, function(err, showOnePoll){
            //    var currentIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                
                 if(showOnePoll.voters.length > 0){
                   for (var i = 0; i < showOnePoll.voters.length; i++){
                        // if(currentIp===showOnePoll.voters[i].ipAddress){
                        //     req.flash("error","You have already voted.");
                        //     res.redirect("back");
                        // }
                        // else{
                            if(req.user){
                                if(req.user._id.equals(showOnePoll.voters[i].id)){
                                     req.flash("error","You have already voted.");
                                     res.redirect("back");
                                }else{
                                    next();
                                }
                            }
                            //next();
                       // }
                    
                  }
                   
                 }else{
                  next();
            }
                
            });
        }
    
}

router.post("/dashboard/:id/vote",oneVote,function(req,res){


        Poll.findById(req.params.id, function(err, showOnePoll){
            if(err){
                console.log("error beg: "+err);
             res.redirect("back");

            }
            else{
                
                 for (var i = 0; i < showOnePoll.optionsArray.length; i++){
                
        
                     if(showOnePoll.optionsArray[i]._id.equals(req.body.optionSubmitted)){
                            
                            showOnePoll.optionsArray[i].value = showOnePoll.optionsArray[i].value+1;
                            
                            //if user is authenticated register vote with user credentials else just ip address
                            
                            if(req.isAuthenticated()){ //comes with "passport package"
                                   showOnePoll.voters.push({id:req.user._id,username:req.user.username});
        
                               }
                                else{
                                    
                                   res.cookie('voted', 'true', optionsCookie)
                                }
                             /////////////////////////////////////////////////////////////////////
                    
                        showOnePoll.save(function(err,dataRet){
                            if(err){
                                console.log("error"+err);
                                res.redirect("back");
                                
                            }
                            else{
                                console.log("updated value"+ dataRet);
                                res.redirect("back");
        
                            }
                            
                        });
        
        
                        }
                        else{
                            
                            }
                        
                }
            }
        });

       
});
////////////////////////////////////////////////////////





module.exports = router;