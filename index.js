require('dotenv').config();
var express = require('express');
var handlebars = require('express-handlebars');
var neo = require('./neo');
var unirest = require('unirest');
var Auth = require('./auth.js');

Auth.Salt(process.env.FB_APP_SECRET);

var server = express();
server.engine('handlebars', handlebars({defaultLayout:'main'}));
server.set('view engine', 'handlebars');

server.use("/static", express.static(__dirname+"/static"));

server.use(function(inReq, inRes, inNext){
	var cookies;
    var i;
    var split, key, value;
	cookies = inReq.headers.cookie;
	inReq.Cookies = {};
	if(cookies)
	{
		cookies = cookies.split("; ");
		for(i=0; i<cookies.length; i++)
		{
			split = cookies[i].indexOf("=");
			key = cookies[i].substring(0, split);
			value = cookies[i].substring(split+1);
			inReq.Cookies[key] = value;
		}
	}
	inNext();
});

server.use(function(inReq, inRes, inNext)
{
	inReq.Auth = {};
	inReq.Auth.LogIn = function(inID)
	{
		inRes.cookie(Auth.Config.KeyID, inID);
		inRes.cookie(Auth.Config.KeyIDHash, Auth.Sign(inID));
	};
	inReq.Auth.LogOut = function()
	{
		inRes.clearCookie(Auth.Config.KeyID);
		inRes.clearCookie(Auth.Config.KeyIDHash);
	};
	inReq.Auth.ID = inReq.Cookies[Auth.Config.KeyID];
	inReq.Auth.IDHash = inReq.Cookies[Auth.Config.KeyIDHash];
	if(inReq.Auth.ID === undefined || inReq.Auth.IDHash === undefined)
	{
		inReq.Auth.LoggedIn = false;
	}
	else
	{
		inReq.Auth.LoggedIn = Auth.Verify(inReq.Auth.ID, inReq.Auth.IDHash);
	}
	inNext();
});
server.get("/", function(inReq, inRes){
    inRes.render("home");
});
server.get("/profile", function(inReq, inRes){
    
    neo([{statement:"match (u:User {id:\""+inReq.Auth.ID+"\"}) return u"}])
    .then(function(inResponse){
        console.log(inResponse[0].data[0].row[0]);
        inRes.render("profile", inResponse[0].data[0].row[0]);
    });
})
server.get("/login-fb", function(inReq, inRes){
    
    var code, error;
    var profile;
    var GETPromise
    
    if(inReq.Auth.LoggedIn){
        inRes.redirect("/profile");
    }
    
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
            
            console.log("");
            inReq.Auth.LogIn(profile.id);
            inRes.redirect("/profile");
            
        }, function(inResponse){
            
            return neo([{
                statement:"create (u:User {id:\""+profile.id+"\", name:\""+profile.name+"\"}) return u"
            }]);
            
        }).then(function(inResponse){
            
            inReq.Auth.LogIn(profile.id);
            inRes.redirect("/profile");
            
        });
        
    }else{
        
        inRes.redirect(process.env.FB_API_OAUTH + "?client_id=" + process.env.FB_APP_ID + "&redirect_uri=" + process.env.FB_APP_URL);
        
    }
});

server.listen(80);