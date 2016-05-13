var express = require('express');
var neo4j = require('./neo.js');

/*
neo4j([{statement:"create (u:User {name:'person', age:25})"}], function(inResponse){
    console.log(inResponse.body);
});
*/

neo4j([{statement:"match (u:User) return u"}], function(inResponse){
    console.log(inResponse.body);
});