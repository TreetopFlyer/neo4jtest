var express = require('express');
var handlebars = require('express-handlebars');
var neo = require('./neo');
var unirest = require('unirest');

/*
neo4j([{statement:"create (u:User {name:'person', age:25})"}], function(inResponse){
    console.log(inResponse.body);
});
*/

var API = {};
API.GetRows = function(inResponse){
    
    var list = inResponse.body.results[0].data;
    var out = [];
    var i;
    for(i=0; i<list.length; i++){
        out.push(list[i].row[0]);
    }
    return out;
}
API.GetUsers = function(){
    var payload = {
        statement:"match(u:User) return u"  
    };
    neo([payload], function(inResponse){
        console.log(API.GetRows(inResponse));
    });
};
API.CreateUser = function(inName){
    
    var payload = {
        statement:"create (u:User {p}) return u",
        parameters:{
            p:{
                name:inName,
                id:Math.floor(Math.random()*10000)
            }
        }
    };
    
    neo([payload], function(inResponse){
        console.log(API.GetRows(inResponse));
    });
};
API.DeleteUser = function(inID){
    var payload = {
        statement:"create (u:User {p}) return u",
        parameters:{
            p:{
                name:inName,
                id:Math.floor(Math.random()*10000)
            }
        }
    };
    
    neo([payload], function(inResponse){
        console.log(API.GetRows(inResponse));
    }); 
};

API.GetUsers();


var server = express();
server.engine('handlebars', handlebars({defaultLayout:'main'}));
server.set('view engine', 'handlebars');
server.get("/", function(inReq, inRes){
    inRes.render("home");
});
server.get("/login-fb", function(inReq, inRes){
    
    var code = inReq.query.code;
    var error = inReq.query.error;
    if(code){
        unirest
        .get("https://graph.facebook.com/v2.3/oauth/access_token")
        .query({
            client_id:"1628003107468799",
            client_secret:"2db01a126ae61f9b885262470c2abc88",
            redirect_uri:"http://192.168.2.101/login-fb",
            code:code})
        .end(function(inResToken){
            unirest
            .get("https://graph.facebook.com/me")
            .query({
                "access_token":inResToken.body.access_token
            })
            .end(function(inResProfile){
                inRes.send(inResProfile.body);
            });  
        });
    }else{
        inRes.redirect("https://www.facebook.com/dialog/oauth?client_id=1628003107468799&redirect_uri=http://192.168.2.101/login-fb");
    }
});

server.listen(80);