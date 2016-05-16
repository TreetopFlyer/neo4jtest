var sha1 = require("sha1");

var Auth = {};
Auth.Config = {};
Auth.Config.HashSecret = "aqowfhawfiohawf"; // wow very safe. much secure.
Auth.Config.KeyID = "Auth.ID";
Auth.Config.KeyIDHash = "Auth.IDHash";
/*sign a message with the hash secret*/
Auth.Sign = function(inMessage)
{
	return sha1(Auth.Config.HashSecret + inMessage);
};
/*was this message signed with the correct secret?*/
Auth.Verify = function(inMessage, inSignedMessage)
{
	if(Auth.Sign(inMessage) === inSignedMessage)
		return true;
		
	return false;
};
Auth.Salt = function(inString){
    Auth.Config.HashSecret = inString;
};

module.exports = Auth;