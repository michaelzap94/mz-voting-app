//required initial packages
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
var User = require("./schemas/user");




// Set the environment variable for DB.

var url = process.env.DATABASEURLVA || "mongodb://localhost/mz-voting-app-db";
mongoose.connect(url);




//AUTHENTICATION---------------------------------------------------------------------

var expressSession = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");//we use this in the modals/user.js

//WE NEED THIS LINES FOR SESSIONS
app.use(expressSession({
    secret:"I am a full stack developer",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

//create a NEW Local Strategy using the data from User(user.js) which uses the "passport-local-mongoose"
passport.use(new LocalStrategy(User.authenticate()));

//USE SERIALIZE AND DESIRIALIZE USER from the user.js model which uses the "passport-local-mongoose"
passport.serializeUser(User.serializeUser());//and then encode the data and put it back in the session
passport.deserializeUser(User.deserializeUser());// reading session,taking the data from session that's encoded, unencode it 
//////////////////////////////




//EVERY FUNCTION USED IN app.use WILL BE USED IN EVERY SINGLE ROUTE.
//req.user is included in Passport package and
//-indicates current user, if none then null.
app.use(function(req,res,next){
    res.locals.currentUser = req.user;// req.locals will pass currentUser to every ejs as variable.(in this case header.ejs)
    next(); // we need next() to move to the next middleware.
    
});

//pass a variable for every ejs to use it(error,success)
//it's a key/value map, where "error" and "success in this file are the keys
app.use(function(req,res,next){
    res.locals.error = req.flash("error");// req.locals will pass currentUser to every ejs as variable.(in this case header.ejs)
       res.locals.success = req.flash("success");// req.locals will pass currentUser to every ejs as variable.(in this case header.ejs)

    next(); // we need next() to move to the next middleware.
    
});

app.get("/",isLoggedIn,function(req,res){
     //   res.sendFile(__dirname+"/public/test.html");

        res.render("index");
});



///REQUIRE ROUTES USING "express.Router()" in the routes models


var userAuthenRoutes = require("./routes/userAuthen");
app.use(userAuthenRoutes);

var pollsRoutes = require("./routes/polls");
app.use(pollsRoutes);




//CHECK IF USER IS LOGGED IN, USING THIS function middleware in the "/secret" route.
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){ //comes with "passport package"
    
       res.redirect("/dashboard"); 

    }
    else{

         next(); //continue to callback
    }
}
//////////////

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});