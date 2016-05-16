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



var server = express();
server.engine('handlebars', handlebars({defaultLayout:'main'}));
server.set('view engine', 'handlebars');

server.use(function(inReq, inRes, inNext){
	var cookies;
    var i;
    var split, key, value;
	cookies = inReq.headers.cookie;
	inReq.cookies = {};
	if(cookies)
	{
		cookies = cookies.split("; ");
		for(i=0; i<cookies.length; i++)
		{
			split = cookies[i].indexOf("=");
			key = cookies[i].substring(0, split);
			value = cookies[i].substring(split+1);
			inReq.cookies[key] = value;
		}
	}
	inNext();
});
server.get("/", function(inReq, inRes){
    inRes.render("home");
});
server.get("/profile", function(inReq, inRes){
    
})
server.get("/login-fb", function(inReq, inRes){
    
    var code, error;
    var profile;
    var GETPromise
    
    GETPromise = function(inURL, inQuery){
        return new Promise(function(inResolve, inReject){
            unirest.get(inURL).query(inQuery).end(inResolve);
        });
    }
    
    code = inReq.query.code;
    error = inReq.query.error;
    profile = {};
    
    if(code){
        
        GETPromise(process.env.FB_API_TOKEN,{
            "client_id":process.env.FB_APP_ID,
            "client_secret":process.env.FB_APP_SECRET,
            "redirect_uri":process.env.FB_APP_URL,
            "code":code
        }).then(function(inResponse){
            return GETPromise(process.env.FB_API_PROFILE, {
                "access_token":inResponse.body.access_token});
        }).then(function(inResponse){
           profile = JSON.parse(inResponse.body);
           return neo([{
               statement:"match (u:User {id:\""+profile.id+"\"}) return u"
           }]);
        }).then(function(inResponse){
            inRes.redirect("/");
        }, function(inResponse){
            return neo([{
                statement:"create (u:User {id:\""+profile.id+"\", name:\""+profile.name+"\"}) return u"
            }]);
        }).then(function(inResponse){
            inRes.redirect("/");
        });
        
    }else{
        
        inRes.redirect(process.env.FB_API_OAUTH + "?client_id=" + process.env.FB_APP_ID + "&redirect_uri=" + process.env.FB_APP_URL);
        
    }
});

server.listen(80);