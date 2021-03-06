
var express = require('express');
var bodyParser = require('body-parser')
var mongo = require('mongodb')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var localStorage = require('localStorage')
var app = express();
//modules
var user = require("./routes/authenticate")
var url = "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@ds235785.mlab.com:35785/singletempo";

console.log(process.env.TEST)
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.use(session({secret:"asdflkj",
                saveUninitialized: true,
                resave: true}));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/takesurvey/:str", function (request, response) {
  /// ==> takesurvey/eolculnamo2+dogs_or_cats
  var entered = request.params.str;
  var dataArray = entered.split("+");
  var chartName = dataArray[1].replace(/_/g," ");
  response.cookie("guest", dataArray[0])

  user.takeSurvey(dataArray[0],chartName,function(err,res){
    //prepare for cookies
    var b = JSON.stringify(res);
    var a = b.slice(2, b.length-2);
    var c= a.split("},{")
    var toCookies = "";

    c.forEach(function(x,i){
      var e = x.split(",")
      var d = e[0].split(":")
      console.log(d[1] +" " + JSON.stringify(chartName))
      if(d[1] === JSON.stringify(chartName)){
        console.log(d[1]+"Willsend"+x);
        toCookies = x;
        }
    })

    console.log("A "+c[0])
      console.log(toCookies)
      response.cookie("guestChart", toCookies);
         response.sendFile(__dirname + '/views/takeSurvey.html');
  })

});
app.get("/mySurveys", function (request, response) {
  console.log(request.cookies[1])
  response.sendFile(__dirname + '/views/myCharts.html');
});
app.get("/dashboard", function (request, response) {
  console.log(request.cookies)
  response.sendFile(__dirname + '/views/dash.html');
});
app.get("/logout", function(req,res){
 // user.logout(req.cookies.user,function(data){

    res.clearCookie("userData");
    req.session.destroy();
  res.clearCookie("_id")
  res.clearCookie("user")
  res.clearCookie("password")
  res.clearCookie("chart")
  res.redirect("/")
//  })

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
      console.log(data)
      var string_data_chart = JSON.stringify(data.chart)
      res.cookie("user",data.user)
      res.cookie("userData",string_data_chart)
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
 
  user.newChart(dataObject,req.cookies.user,function(err, result){
    res.cookie("userData", JSON.stringify(result.chart))
      res.redirect("/dashboard")
  });


});

app.post("/submitResponse", function(req,res){
  console.log(req.body.nonuser)
  if(req.body.nonuser == "false"){
var updatedData = {
  "user": req.cookies.user,
  "title":req.body.title,
  "data": req.body.bawton,
  "nonuser": req.body.nonuser
};
}

  else if(req.body.nonuser == "true"){

    var updatedData = {
  "user": req.cookies.guest,
  "title":req.body.title,
  "data": req.body.bawton,
  "nonuser": req.body.nonuser
};

  }

  if(updatedData.data !== undefined){
user.updateChart(updatedData, function(vecchio, nuovo,nonUserTest){
      res.clearCookie("userData")
    res.cookie("userData", nuovo);   
    res.clearCookie("guestChart")  
       res.cookie("guestChart", nuovo);
  res.redirect("back")

  if(!nonUserTest){
 
  res.redirect("/mySurveys")
}
  if(nonUserTest){
  

}
});
}
else{
  res.redirect("back")
}

});

app.get("/random", function(req,res){
user.randomButton(function(user,chart){
  if(user === null){
    res.redirect("/random")
  }
  else{
    res.redirect("/takesurvey/"+user+"+"+chart)
  }
})
});

app.get("/deleter", function(req,res){
  var stored = req.cookies.delete
  console.log(stored)
  var arr = stored.split(",")
  var information = {
    user: arr[0],
    chart: arr[1]
  }
  console.log("Information: "+ information.chart)
  user.chartDelete(information.user,information.chart, function(cooks){
    console.log(cooks)
    res.cookie("userData", cooks)
    res.redirect("/mySurveys")
  })
 
});
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
