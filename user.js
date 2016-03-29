var User = function(ownID){ 
	this.id = ownID;
	this.talkingPartner;
	this.listeningPartner;

}

User.prototype.assignPartners = function(talktoID, listentoID){
	this.talkingPartner = talktoID;
	this.listeningPartner = listentoID;
}

module.exports = {
	create:function(data){
		return new User(data);
	}
};