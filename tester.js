require('dotenv').config();
var db = require('./db/neo4j.js');

var id, name;

id = "123";
name = "Tester";

db.getUser(id).then(
    function(inResolveData){
        console.log("user found", inResolveData);
        throw {};
    },
    function(inRejectData){
        console.log("user NOT found", inRejectData);
        return db.createUser(name, id);
}).then(
    function(inResolveData){
        console.log("user created", inResolveData);
    }, function(inRejectData){
        console.log("user was NOT created", inRejectData);
});