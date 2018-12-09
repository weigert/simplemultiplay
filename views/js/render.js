//Create the renderer
var renderer = PIXI.autoDetectRenderer(256, 256, {roundPixels: false, transparent: true, antialias: false});
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();

//This `setup` function will run when the image has loader
var grass = [];
//All Loaded Characters
var chars = [];

function setup() {

  	for(var i=0; i<760; i++){
        grass.push(new PIXI.Sprite(
          PIXI.loader.resources["images/grass1.png"].texture
        ));		
  		grass[i].scale.set(5,5);
  		grass[i].position.set((i%40)*40-position.x*40-20,((i-(i%40))/40)*40-position.y*40-20);
  		stage.addChild(grass[i]);
	}

	var rectangle = new PIXI.Graphics();
	rectangle.beginFill(0x333333);
	rectangle.drawRect(20, 20, 400, 150);
	rectangle.endFill();
	rectangle.beginFill(0xFF66CC);
	rectangle.drawRect(180, 45, 215, 20);
	rectangle.endFill();
	rectangle.beginFill(0xFFCC66);
	rectangle.drawRect(180, 85, 215, 20);
	rectangle.endFill();
	rectangle.beginFill(0x66FFCC);
	rectangle.drawRect(180, 125, 215, 20);
	rectangle.endFill();
	stage.addChild(rectangle);

  //Create the `cat` sprite from the texture
  	var char = new PIXI.Sprite(
  	  	PIXI.loader.resources["images/player.png"].texture
  	);

  	char.scale.set(20,20);
  	char.position.set(15,15);

  //Add the Character Bar to the stage
 	stage.addChild(char);

  //All Loaded Players
}

function gameLoop(){
  requestAnimationFrame(gameLoop);
  //Mapdata Loaded From Tiled
  //Update The Grass According To Subjective Position
   for(var i=0; i<760; i++){
    grass[i].position.x = (i%40)*40-players[ID].x*40-20;
    grass[i].position.y = ((i-(i%40))/40)*40-players[ID].y*40-15;
    }
  //Render the stage to see the animation
  renderer.render(stage);
}

//Start the game loop
PIXI.loader
  .add("images/player.png")
  .add('images/grass1.png')
  .load(setup);
gameLoop();

function drawNewPlayer(){
  //Push A New Character For Every Player Online
  var newPlayer = new PIXI.Sprite(
      PIXI.loader.resources['images/player.png'].texture
  );
  newPlayer.scale.set(5,5);
  newPlayer.position.x = window.innerWidth/2-20+(players[players.length-1].x-position.x)*40;
  newPlayer.position.y = window.innerHeight/2-20+(players[players.length-1].y-position.y)*40;
  chars.push(newPlayer);
  stage.addChild(chars[chars.length-1]);
  console.log("Rendering Player");
}

function undrawPlayer(e){
  //Push A New Character For Ever Player Online
  console.log("Removing Player.");
  stage.removeChild(chars[e]);
  chars.splice(e,1);
}

function updatePlayerPosition(){
  //If You Yourself Moved, All Players Updated.
  //Theoretically Faster On A Large Scale If You Only Update Moved Players,
  //And All Players If You Yourself Move.
  for(var i=0; i<players.length; i++){
    chars[i].position.x = window.innerWidth/2-20+(players[i].x-position.x)*40;
    chars[i].position.y = window.innerHeight/2-20+(players[i].y-position.y)*40;
  }
  console.log("Player "+players[i].name+" has moved.");
}
