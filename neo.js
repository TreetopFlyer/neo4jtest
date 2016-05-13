var unirest = require('unirest');
var config, headers, rest;

config = {
    username:'neo4j',
    password:'admin',
    endpoint:'http://localhost:7474/db/data/transaction/commit'
}

headers = {
    'Authorization': 'Basic ' + new Buffer(config.username+':'+config.password).toString('base64'),
    'Content-Type': 'application/json'
};

rest = function(inStatements, inHandler){
    unirest
    .post(config.endpoint)
    .headers(headers)
    .send({statements: inStatements})
    .end(inHandler);
};

module.exports = rest;