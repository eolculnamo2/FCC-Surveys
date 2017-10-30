var mongo = require('mongodb');
var cookieParser = require('cookie-parser')
//Plan: userInfo creates new data. Everthing else is update in order to add

var url = "mongodb://eolculnamo2:ghost12@ds235785.mlab.com:35785/singletempo";
module.exports = {
    newChart: function(info, id){
          mongo.MongoClient.connect(url,function(err,db){
          db.collection('barCharts').findOne({"user": id}, function(err,res){
            db.collection('barCharts').update(
                                              {user: id},
                                              {$push: {chart: info}}, function(err,result){
              console.log(res)
            })
          });
    });
},
    newUser: function(userInfo,callback){
          mongo.MongoClient.connect(url, function(err,db){

             db.collection('barCharts').findOne({"user": userInfo.user}, function(err,res){
              if(res){
                callback(null,false)
              }
              else if(!res){
              db.collection('barCharts').insert(userInfo, function(err,res){
                            
              })
                callback(null,true)
              }  
        }); 
      })
          
      //End newUser Function callback Hell
    },
  authenticateUser: function(userInfo, callback){
     mongo.MongoClient.connect(url, function(err,db){
       db.collection('barCharts').findOne({user: userInfo.user, password: userInfo.password}, function(err,result){
          if(result){
          callback(null, true,result)
          }
         else{
           callback(null, false)
         }
        })
     })
    
  },
  changePassword: function(info, callback){
  
    mongo.MongoClient.connect(url, function(err,db){
      db.collection("barCharts").update(
        {user: info.user, password: info.currentPassword},
        {$set: {password: info.newPassword}}
        , function(err, result){
      console.log(info.newPassword);
      });
    })
  }
}