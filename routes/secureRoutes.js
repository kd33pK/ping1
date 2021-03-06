var express = require('express');
var app=express();
var request = require('request');
var User= require('../models/user');
var Service=require('../service/intervalService');
var JwtToken=require('../service/jwtToken');
var PingData = require('../models/pingData');
var Token = require('../models/tokenData');

var jwt =require('jsonwebtoken');
var secureRoutes = express.Router();
app.use('/secure-api',secureRoutes);
app.on('listening', function () {
    console.log('deepak kumar');
  });
secureRoutes.use(function(req,res,next){
    
        var token=req.body.token;
        if(token){
            jwt.verify(token,process.env.SECRET_KEY,function(err,decode){
                if(err){
                    res.status(500).send('authorization required')
                }
                else{
                    next();
                }
            })
        }
        else{
            res.send('authorization required')
        }
    
    });


      secureRoutes.post('/sendPing',function(req,res){
        
            var id=req.body.id;
            var tokenId;
            var chatId;
            Token.findData(req.body.userId,function(err,data){
                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    tokenId=data.tokenId;
                    chatId=data.chatId;

                    PingData.findData(id,function(err,data){
                        if(err){
                            res.json({"errorcode":1})
                        }
                        else{
                           // console.log(data)
                           var datas={
                                id:data.id,
                                familyName:data.familyName,
                                address:data.ip,
                                port:data.port
                            }
                            console.log(datas);
                           var repeatTime=data.repeatTime*60000;
                           var time=data.pingTime;
                           var message="Time taken to ping is greater than " + time;
                            Service.startPing(datas,message,tokenId,chatId,repeatTime,data.pingTime,function(data){
                                if(!data){
                                res.json(data);
                                }
                                if(data){
                                    res.json(data);
                                    }
                           })    
                
                  }  
                });


                }
        
            });

        });
        secureRoutes.post('/setToken',function(req,res){
            
            var token =new Token({
                userId:req.body.userId,
                tokenId:req.body.tokenId,
                chatId:req.body.chatId
            })
            Token.createToken(token, function(err, data){
                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    res.json({"errorcode":0})
                }
            });
            })
            secureRoutes.post('/setPing',function(req,res){
                
                var pingData =new PingData({
                    userId:req.body.userId,
                    familyName:req.body.familyName,
                    ip:req.body.ip,
                    port:req.body.port,
                    pingTime:req.body.pingTime,
                    repeatTime:req.body.repeatTime,
                    status:'stopped',
                    position:0
                })
                PingData.createPingData(pingData, function(err, data){
                    if(err){
                        res.json({"errorcode":1})
                    }
                    else{
                        res.json({"errorcode":0})
                    }
                });
                
            })


        secureRoutes.post('/getData',function(req,res){
            console.log(req.body.userId);
            PingData.getData(req.body.userId,function(err,data){

                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    res.json(data);
                }
            })

        })

        secureRoutes.post('/stopPing',function(req,res){
            var tokenId
            var chatId
            var position
            var id
            var familyName
            Token.findData(req.body.userId,function(err,data){
                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    tokenId=data.tokenId;
                    chatId=data.chatId;

                    PingData.findData(req.body.id,function(err,datas){
                        if(err){
                            res.json({"errorcode":1})
                        }
                        else{
                           // console.log(data)
                           position=datas.position;
                            id=datas._id;
                            familyName=datas.familyName;
                    Service.stopPing(tokenId,chatId,position,id,familyName,function(data){
                        console.log(data);
                        if(data){
                            res.json({'errorcode':0})
                        }
                        else{
                            res.json({'errorcode':1})
                        }
                }) 
            }

                })
            }
            });
        });
        
    
        secureRoutes.post('/deleteData',function(req,res){
            console.log(req.body.userId);
            PingData.deleteData(req.body.id,function(err,data){

                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    console.log(data);
                    res.json(data);
                }
            })
        }); 
        
        secureRoutes.post('/update',function(req,res){
            var id=req.body.id;
            //console.log(req.body);
            var pingData={
                familyName:req.body.familyName,
                ip:req.body.ip,
                port:req.body.port,
                pingTime:req.body.pingTime,
                repeatTime:req.body.repeatTime
            }
            console.log(pingData);
            PingData.update(id,pingData, function(err, data){
                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    res.json({"errorcode":0})
                }
            });
            
        })


        secureRoutes.post('/getTokenData',function(req,res){
            Token.findData(req.body.userId,function(err,data){
                if(err){
                    res.json({"errorcode":1})
                }
                else{
                    res.json(data);

                }


        })
    });

    secureRoutes.post('/getUsers',function(req,res){
        User.findData(function(err,data){
            if(err){
                res.json({"errorcode":1})
            }
            else{
                res.json(data);

            }


    })
});


    secureRoutes.post('/changePassword',function(req,res){
        User.updatePassword(req.body.userId,req.body.newPassword,function(err,data){
            if(err){
                res.json({"errorcode":1})
            }
            else{
                res.json({"errorcode":0})
            }


    })
});
      module.exports = secureRoutes;
