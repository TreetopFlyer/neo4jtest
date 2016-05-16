require('dotenv').config();
var express = require('express');
var handlebars = require('express-handlebars');
var middlewareAuth = require('./middleware/auth.js');
var routeOAuth = require('./routes/oauth.js');

var server = express();
server.engine('handlebars', handlebars({defaultLayout:'main'}));
server.set('view engine', 'handlebars');

server.use("/static", express.static(__dirname+"/static"));
server.get("/", function(inReq, inRes){
    inRes.render("home");
});

server.use("/", middlewareAuth);
server.use("/", routeOAuth);


server.listen(80);