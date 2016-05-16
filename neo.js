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

rest = function(inStatements){
    
    return new Promise(function(inResolve, inReject){
        unirest
        .post(config.endpoint)
        .headers(headers)
        .send({statements: inStatements})
        .end(function(inResponse){
            if(inResponse.body.results[0].data.length == 0){
                inReject(inResponse.body.results);
            }else{
                inResolve(inResponse.body.results);
            }
        });
    });

};

module.exports = rest;