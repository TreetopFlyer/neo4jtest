var express = require('express');
var handlebars = require('express-handlebars');
var neo = require('./neo.js');

/*
neo4j([{statement:"create (u:User {name:'person', age:25})"}], function(inResponse){
    console.log(inResponse.body);
});
*/

neo([{statement:"match (u:User) return u"}], function(inResponse){
    console.log(inResponse.body);
});

var server = express();
server.engine('handlebars', handlebars());
server.set('view engine', 'handlebars');
server.get("/", function(inReq, inRes){
    
});