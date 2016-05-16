var express = require('express');
var router = express.Router();
var neo = require('../db/neo.js');
var unirest = require('unirest');


router.get("/profile", function(inReq, inRes){
    neo([{statement:"match (u:User {id:\""+inReq.Auth.ID+"\"}) return u"}])
    .then(function(inResponse){
        console.log(inResponse[0].data[0].row[0]);
        inRes.render("profile", inResponse[0].data[0].row[0]);
    });
});

router.get("/logout-fb", function(inReq, inRes){
    inReq.Auth.LogOut();
    inRes.redirect("/");
});

router.get("/login-fb", function(inReq, inRes){
    
    var code, error;
    var profile;
    var GETPromise
    
    if(inReq.Auth.LoggedIn){
        console.log("already logged in");
        console.log(inReq.Cookies);
        inRes.redirect("/profile");
        return;
    }
    
    GETPromise = function(inURL, inQuery){
        return new Promise(function(inResolve, inReject){
            unirest.get(inURL).query(inQuery).end(inResolve);
        });
    }
    
    code = inReq.query.code;
    error = inReq.query.error;
    profile = {};
    
    if(!code){
        //// redirect to oauth dialogue
        var url = process.env.FB_API_OAUTH + "?client_id=" + process.env.FB_APP_ID + "&redirect_uri=" + process.env.FB_APP_URL
        console.log("starting oAuth", url);
        inRes.redirect(url);
    }else{
        
        console.log("code recieved, getting token");
        GETPromise(process.env.FB_API_TOKEN,{
            //// exchange code for token
            "client_id":process.env.FB_APP_ID,
            "client_secret":process.env.FB_APP_SECRET,
            "redirect_uri":process.env.FB_APP_URL,
            "code":code
            
        }).then(function(inResponse){
            //// get user profile with token
            console.log("access token recieved", inResponse.body.access_token, "getting profile")
            return GETPromise(process.env.FB_API_PROFILE, {
            "access_token":inResponse.body.access_token});
            
        }).then(function(inResponse){
            //// see if profile already exists...
            profile = JSON.parse(inResponse.body);
            console.log("profile recieved", profile);
            return neo([{
                statement:"match (u:User {id:\""+profile.id+"\"}) return u"
            }]);
            
        }).then(function(inResponse){
            //// ...if so, do login and show profile
            console.log("showing profile page", profile);
            inReq.Auth.LogIn(profile.id);
            inRes.redirect("/profile");
        }, function(inResponse){
            //// ...otherwise, create the profile node in neo4j...
            console.log("creating profile");
            return neo([{
                statement:"create (u:User {id:\""+profile.id+"\", name:\""+profile.name+"\"}) return u"
            }]);
            
        }).then(function(inResponse){
            //// ...and then login and show profile
            console.log("new profile was created. redirecting to profile page");
            inReq.Auth.LogIn(profile.id);
            inRes.redirect("/profile");
            
        });
    }
});

module.exports = router;