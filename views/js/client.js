//Connect to Socket
var socket = io();

var name = getName();
console.log("Welcome "+name+"!");

var ID;
var players = [];
var position = new Object();
position.x = Math.floor(Math.random()*10);
position.y = Math.floor(Math.random()*10);
//Place Holder Stuff For Now

function setEventHandlers(){
	socket.on("connect", onSocketConnected);	//Socket Connection
	socket.on("disconnect", onSocketDisconnect);//Socket Disconnection

	//Should Be Rewritten To Write To Server!
	onkeydown = function(e){
		//For Any Typing Action Going On:
		//socket.emit('keyBoardEvent', e.keyCode);
		//Get Current String
		var s = document.getElementById("e").innerHTML;

		if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
			//Emit Which Way You Moved and Your ID
			socket.emit('playerNudgePlayer', e.keyCode, ID);
			//This is For Interpolation, So That The Grass Always
			if(e.keyCode==37){
				position.x -= 0.5;
			}
			else if(e.keyCode==38){
				position.y -= 0.5;
			}
			else if(e.keyCode==39){
				position.x += 0.5;
			}
			else if(e.keyCode==40){
				position.y += 0.5;
			}
		}

		else if(e.keyCode != 16 && e.keyCode != 13 && e.keyCode != 91 ){
			//Make Sure It Meets Requirements
			//Backspace
			if(e.keyCode == 8 && s.length>=7){
				s = s.slice(0,s.length-2);
				document.getElementById("e").innerHTML = s+'_';
			}

			if(s.length <= 50 && e.keyCode!=8){
				s = s.slice(0,s.length-1);
				document.getElementById("e").innerHTML = s+e.key+'_';
			}
		}

		//Hit Enter
		else if(e.keyCode == 13){
			//Send Message
			socket.emit('playerConsoleMessage', ID, s.slice(4,s.length-1));
			//Clear the Typing line.
			document.getElementById('e').innerHTML = "> _";
		}
	}
}

function onSocketConnected(){
	console.log("Connected to Server.");
}

function onSocketDisconnect(){
	console.log("Disconnected from Server.");
}

socket.on('serverNewPlayer', function(eName, x, y){
	var player = new Object();
		player.name = eName;
		player.x = x;
		player.y = y;
	console.log("Player "+eName+" joined the game.");
    players.push(player);
    drawNewPlayer();
});

socket.on('serverQuitPlayer', function(e){
	console.log("Player "+players[e].name+" with ID "+e+" left the game.");
	players.splice(e,1);
	//If Someone With A Lower ID Quits, You Move Down one.
	if(e<ID){
		--ID;
	}
	undrawPlayer(e);
});

//New Message Pushed From Server.
socket.on('serverConsoleMessage', function(e){
	//Already Completely Formatted
	console.log(e);
	document.getElementById('a').innerHTML = document.getElementById('b').innerHTML;
	document.getElementById('b').innerHTML = document.getElementById('c').innerHTML;
	document.getElementById('c').innerHTML = document.getElementById('d').innerHTML;
	document.getElementById('d').innerHTML = e;
});

socket.on('serverSetID', function(e){
	//Player Receives A Unique Identifier
	console.log('Received Unique ID '+e+'.');
	ID = e;
	//The Player Has To Log In With A Name
	//The Name Previously Entered Is Sent
	//The Player Must Create An Instance Of Himself
	//In Order To Spawn Other Players
	console.log("Spawning at X:"+position.x+" Y:"+position.y+".");
	//Now It Can Tell Others Where Its At
	socket.emit("playerLogin", name, position.x, position.y);
});


socket.on('serverNudgePlayer', function(e, id){
	console.log(e);
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
	//Prove That The Player Has Moved
	updatePlayerPosition(id);
});

//Get the Name Variable From HTML
function getName()
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == "username"){return pair[1];}
       }
       return(false);
}

setEventHandlers();
