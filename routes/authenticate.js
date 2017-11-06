var mongo = require('mongodb');
var cookieParser = require('cookie-parser')
//Plan: userInfo creates new data. Everthing else is update in order to add

var url = "mongodb://eolculnamo2:ghost12@ds235785.mlab.com:35785/singletempo";
module.exports = {
    newChart: function(info, id, callback){
          mongo.MongoClient.connect(url,function(err,db){
          db.collection('barCharts').findOne({"user": id}, function(err,res){
            db.collection('barCharts').update(
                                              {user: id},
                                              {$push: {chart: info}}, function(err,result){
                       db.collection('barCharts').findOne({"user": id}, function(err,ress){
                        callback(null,ress)
                       });
            })
          });
    });
},
    takeSurvey: function(user,chart,callback){
      console.log("Called: "+user+ " "+chart)
          mongo.MongoClient.connect(url, function(err,db){
            db.collection('barCharts').findOne({"user": user}, function(err,res){
              callback(null, res.chart);
            })
          })
    },
    updateChart: function(info,callback){
      mongo.MongoClient.connect(url, function(err,db){
        db.collection('barCharts').findOne({"user": info.user}, function(err,res){
          var oldArrayToDelete = [];
        
          for(var i=0; i<res["chart"].length; i++){
            oldArrayToDelete.push(res["chart"][i]);
          }
            var deletingArray = JSON.stringify(oldArrayToDelete);
          var updater =[]
          
           res["chart"].forEach((x,i)=>{
            
           if(x.title === info.title){
           
            var locator = info.data
         console.log("Locator: "+JSON.stringify(res["chart"][i]))
            res["chart"][i][locator]++;
            updater = res.chart;
          } 
          })
           console.log("DELETER: " + deletingArray)
            console.log("UPDATER: " + JSON.stringify(updater))
           callback(deletingArray,JSON.stringify(updater), info.nonuser);
          db.collection('barCharts').update(
                                              {user: info.user},
                                              {$set: {chart: updater}}
                                           )
         
                                         })
       })
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
/*
  logout: function(info, callback){
    mongo.MongoClient.connect(url,function(err,db){
      db.collection('barCharts').findOne({user: info}, function(err,res){
        callback(res.chart)
      })
    })
  },
*/
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