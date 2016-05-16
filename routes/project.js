var express = require('express');
var router = express.Router();
var neo = require('../neo.js');

router.get("/create/:name", function(inReq, inRes){
    if(inReq.Auth.LoggedIn){
        neo([{statement:"create (p:Project {name:'"+inReq.param("name")+"' id:'"+Math.floor(Math.random()*1000000)+"'})"+
                        "match (u:User {id:"+inReq.Auth.ID+"})" + 
                        "create (u)-[:Owns]->(p)"}]).then(
            function(inResponse){
                
            }
        );
    }
})