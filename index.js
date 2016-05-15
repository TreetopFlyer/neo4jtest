require('dotenv').config();
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

function getPromise(inURL, inQuery){
    return new Promise(function(inHandler){
        unirest.get(inURL).query(inQuery).end(inHandler);
    });
}


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
        
        getPromise(process.env.FB_API_TOKEN, {
            client_id:process.env.FB_APP_ID,
            client_secret:process.env.FB_APP_SECRET,
            redirect_uri:process.env.FB_APP_URL,
            code:code
        }).then(function(inResponse){
            return getPromise(process.env.FB_API_PROFILE, {
                access_token:inResponse.body.access_token
            });
        }).then(function(inResponse){
           inRes.send(inResponse.body); 
        });
        
    }else{
        
        inRes.redirect(process.env.FB_API_OAUTH + "?client_id=" + process.env.FB_APP_ID + "&redirect_uri=" + process.env.FB_APP_URL);
        
    }
});

server.listen(80);