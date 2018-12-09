//Launch the Server Notification
console.log("Launching Roguelike Server.");
console.log("Loading Dependencies...")

//Webserver
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = __dirname + '/views/';

//Sockets
var io = require('socket.io')(http);
var fs = require('fs');
var xml = require('xml');
var xml2js = require('xml2js');
var DOMParser = require('xmldom').DOMParser;
console.log("Dependencies loaded.")

//Listening on Port 3000
http.listen(3000, function () {
  console.log('Listening on Port: 3000.');
});

app.use(express.static('views'));

//Push The HTML File To The Client
app.get('/', function(req,res){
	res.sendFile('index.html');
});

//Server-Side Game Logic
//Array (stack) to track Players
var players=[];

//Add Game Event Handlers
var setEventHandlers = function(){

	//When player connected
	io.on('connection', function(socket){

    //Give the player a new ID (next available)
		console.log('User connected. Assigning ID '+players.length+'.');

    //Prepare to add a player object to the stack
		var player = new Object();
        player.socket = socket.id;

        //Broadcast the Player His ID
        socket.emit('serverSetID', players.length);

    //Event during connection: A Player Has Sent His Name Data back to server
		socket.on('playerLogin', function(e, x, y){
			player.name = e;
			player.x = x;
			player.y = y;
			players.push(player);
        	//Broadcast to Other Players that someone has joined.
        	//This Needs to be Done With Whole Player Instance!
        	socket.broadcast.emit('serverNewPlayer', player.name, x, y);
        	//Emit to the connected player all other players positions except his own
        	for(var i=0; i<players.length; ++i){
        		socket.emit('serverNewPlayer', players[i].name, players[i].x, players[i].y);
        	}
		});

    //Event during connection: A player disconnects
		socket.on('disconnect', function(){
			//Remove Player From Array.
			var len = players.length;
        	for(var i=0; i<len; ++i) {
            	if(players[i].socket == socket.id){
            		console.log('User with ID '+i+' disconnected.');

            		//Broadcast That A Player Has Left The Game.
            		socket.broadcast.emit('serverQuitPlayer', i);
             	   	players.splice(i,1);
                	break;
            	}
        	}
		});

		//Event: Movement of Players
		//When A Player Presses A Key, The Server Updates The Info And Broadcasts it to all.
		//Nudge is for single movement, Move is For TELEPORTATION
		socket.on('playerNudgePlayer', function(e, id){//var e is the key pressed, ID is player ID
			console.log(players[id].name+" moved.");
			//Server Needs To Track The Players Position
			if(e==37){
				players[id].x -= 0.5;
			}
			else if(e==38){
				players[id].y -= 0.5;
			}
			else if(e==39){
				players[id].x += 0.5;
			}
			else if(e==40){
				players[id].y += 0.5;
			}
			//Give the player his own confirmed movement back
			socket.emit('serverNudgePlayer', e, id);
      //Give all other players the players confirmed movement
			socket.broadcast.emit('serverNudgePlayer', e, id);
		});

		//Event: Player enters something into the console
		socket.on('playerConsoleMessage', function(ID, e){
			//Check for Command
			if(e.charAt(1)=="?"){
				console.log("Player issued command: "+e);
				//Command ?command
				if(e==" ?command"){
					var s = "No command for you.";
					socket.emit('serverConsoleMessage', s);
				}
				else if(e==" ?drain"){
					var s = "Drained Health.";
					socket.emit('serverConsoleMessage', s);
				}
			}

			//Otherwise The Player Sent A Message
			else{
				console.log('['+players[ID].name+']:'+e);
				//Server Console Message Pushes A Raw Text To Players.
				//Can Thereby Be Used To Send Anything!
				//New Container String
				var s = "["+players[ID].name+"]:"+e;
				socket.emit('serverConsoleMessage', s);
				socket.broadcast.emit('serverConsoleMessage', s);
			}
		});

	});
}

setEventHandlers();
