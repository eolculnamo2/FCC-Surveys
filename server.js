var express = require('express');
var bodyParser = require('body-parser')
var mongo = require('mongodb')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var localStorage = require('localStorage')
var app = express();
//modules
var user = require("./routes/authenticate")
var url = "mongodb://eolculnamo2:ghost12@ds235785.mlab.com:35785/singletempo";

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())
app.use(session({secret:"asdflkj",
                saveUninitialized: true,
                resave: true}));

app.get("/", function (request, response) {

  response.sendFile(__dirname + '/views/index.html');
});
app.get("/dashboard", function (request, response) {
  console.log(request.cookies)
  response.sendFile(__dirname + '/views/dash.html');
});
app.get("/logout", function(req,res){
  req.session.destroy();
  res.clearCookie("_id")
  res.clearCookie("user")
  res.clearCookie("password")
  res.clearCookie("chart")
  res.redirect("/")
})


app.post("/newUser", function(req,res){
  var newUser = {
    user: req.body.user,
    password: req.body.password
  }

  if(req.body.password !== req.body.passwordConfirm){
  res.send("Passwords do not match")
  }
  else if (req.body.password === req.body.passwordConfirm && req.body.password.length > 5){  
  user.newUser(newUser,function(err,result){
  
    if(result === true){
      res.redirect("/")
    }
    else if(result === false){
      res.send(newUser.user+" is not available. Please select a different username.")   
    }
  });
  }
  
  else{
    res.send("Invalid Password.")
  }
});

app.post("/login", function(req,res){
  var loginInfo = {
    user: req.body.user,
    password: req.body.password
  }
  user.authenticateUser(loginInfo, function(err,result,data){
    if(result){
      var string_data_chart = JSON.stringify(data.chart)
      res.cookie("user",data.user)
      res.cookie(string_data_chart)
      console.log(req.cookies.user)
    res.redirect('/dashboard');
    }
    else{
      res.send("Invalid Credentials")
    }
  });
  
});

app.post("/changePass", function(req,res){
    var changeInfo = {
    user: req.cookies.user,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    confirmNewPassword: req.body.confirmNewPassword
  }

    if(changeInfo.newPassword === changeInfo.confirmNewPassword){
    user.changePassword(changeInfo)
      res.redirect("/")
   
    }
  
});

app.post("/submitForm", function(req,res){
  var newData = req.body.count
  newData.unshift(req.body.surveyTitle)
  
  var dataObject ={
    title: newData[0]
  }
  
 newData.forEach(function(x,i){
   if(i>0){
   dataObject[newData[i]] = 0;
   }
 });
  console.log(dataObject)
  user.newChart(dataObject,req.cookies.user);

  res.redirect("/dashboard")
});
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
