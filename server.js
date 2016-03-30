// $ node server.js 

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var User = require('./user.js');

http.listen(3000, function(){
	console.log('listening on port 3000');
});

app.get('/', function(req, res){
	res.sendfile('index.html');
});

activeUsers = [];
gameActive = false;

function assignUsersToUsers(){
	for (var i = 0; i < activeUsers.length; i++){
		var maxIndex = activeUsers.length - 1;
		var selfIndex = 0;
		var talkToIndex = i + 1;
		if (talkToIndex > maxIndex){
			talkToIndex = talkToIndex - activeUsers.length;
		}
		var listenToIndex = i - 1;
		if (listenToIndex < 0){
			listenToIndex = activeUsers.length + listenToIndex;
		}
		console.log("user " + i + " talks to user " + talkToIndex + " and listens to user " + listenToIndex);
		activeUsers[i].assignPartners(activeUsers[talkToIndex].id, activeUsers[listenToIndex].id);
	}
}

function informPeopleaboutIndex(){
	for (var i = 0; i < activeUsers.length; i++){
		var indexData = (i+1) + "/" + activeUsers.length;

		io.sockets.connected[activeUsers[i].id].emit('myindex', indexData);
	}
}

io.on('connection', function(socket){
	console.log('user connected ' + socket.id);
	activeUsers.push(User.create(socket.id));
	console.log(activeUsers);
	informPeopleaboutIndex();
	if(activeUsers.length >= 3){
		gameActive = true;
		console.log("Three players (or more) are connected, let the game begin!");
		
		assignUsersToUsers();
		
		console.log(activeUsers);
	}
	


	socket.on('message', function(data){
		if(gameActive){
			// findindex:
			senderIndex = -1;
			for (var i = 0; i < activeUsers.length; i++){
				if(activeUsers[i].id == socket.id){
					senderIndex = i;
				}
			}
			console.log(socket.id + " sends to " + activeUsers[senderIndex].talkingPartner);
			io.sockets.connected[activeUsers[senderIndex].talkingPartner].emit('message', data);
		}	

	});



	socket.on('disconnect', function() {

		console.log("Client has disconnected " + socket.id);
		var indexToRemove = -1;
		for (var i = 0; i < activeUsers.length; i++){
			if (activeUsers[i].id == socket.id){
				indexToRemove = i;
			}
		}

		activeUsers.splice(indexToRemove, 1);
		if(gameActive && activeUsers.length < 3){
			gameActive = false;
			console.log("the game is over, not enough participants anymore.")
		}
		if(gameActive){
			assignUsersToUsers();
			informPeopleaboutIndex();
		}
		console.log(activeUsers);

		
	});
});