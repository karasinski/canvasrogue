/****************************************
	Rogue v0.0.3
	by Johnny Karasinski
	
	SOON:
	implement an items class
	implement an inventory
	
	move all map related functions/variables to a different file
	move all attack functions/variables to a different file
	
	EVENTUALLY:
	skills/magic/ranged attack (ammunition)
	basic ai
	more dungeon levels
	
	THINGS TO FIX:
	monsters can spawn on top of you! (eek)
	make autotravel only work on tiles that have been seen
	
	WHEN will this game be done?
	This game will be done when a player can go down into the dungeon and battle with different types of enemies. The player should be able to weild items and use skills/magic to defeat opponents.	
	
****************************************/

var $ = function(id) {return document.getElementById(id); };
var textbox = document.getElementById('textbox');

var camera = {
	size: 25,
	offsetX: 0,
	offsetY: 0
}

var look = {
	x: 5,
	y: 5
};

var player = {
	name: "Player",
	color: "#A01010",
	x: 12,
	y: 12,
	n: 2,
	s: 6,
	c: 20,
	health: 25,
	maxhealth: 25,
	experience: 0
};

var mapWidth = 0;
var mapHeight = 0;
var MapScale = 32;
var turn = 1;
var fowRange = 10;

var prevx, prevy;
var grid, path, pathbool = false;

var firstRun = true;
var lookMode = false;

function init() {
	mapWidth = finalMap[0].length;
	mapHeight = finalMap.length;
	textbox.value += 'Start the game!';
	
	bind();
	bindKeys();
	placeItems();
	place();
	fow();
	drawMap();
	firstRun = false;
	
	player.name = prompt("What's your name today?","Player");
	
	gameCycle();
}

function bind() {
	if (lookMode) {
		look.x = player.x + camera.offsetX;
		look.y = player.y + camera.offsetY;
		current = look;
		print('\rLook mode activated!');
		} else if (!lookMode) {
		fow();
		current = player;
		if (!firstRun) print('\rLook mode deactivated!');
	}
}

function bindKeys() {
	document.onkeydown = function(e) {
		switch (e.keyCode) {
			case 76:
			lookMode = !lookMode;
			bind();
			break;
			
			case 104:
			case 38: move(current, 0, -1);	break;
			case 98:
			case 40: move(current, 0, 1);	break;
			case 100:
			case 37: move(current, -1, 0);	break;
			case 102:
			case 39: move(current, 1, 0);	break;
			
			case 101: move(current, 0, 0);	break;
			case 99: move(current, 1, 1);	break;
			case 97: move(current, -1, 1);	break;
			case 105: move(current, 1, -1);	break;
			case 103: move(current, -1, -1);	break;
			case 13: 
			
			if (lookMode) {
				pathbool = true; 
				//console.log('derp');
			}
			break;
			
		}	
	}
}

function gameCycle() {
	drawMap();
	
	while (player.health <= 0) {
		ctx.clearRect(0, 0, Map.width, Map.height);
	}
	
	setTimeout(gameCycle, 1000 / 60);
}

function move(object, x, y) {
	
	var fail = false;
	//console.log(object);
	
	var newX = object.x + x; // calculate new player position
	var newY = object.y + y;
	
	if (isBlocking(object, newX, newY)) { // are we allowed to move to the new position?
		return; // nope!
	}
	
	//player moves first
	if (object == player) {
		for (var i = 0; i < monsters.length; i++) {
			if ((monsters[i].health > 0) && (newX == monsters[i].x) && (newY == monsters[i].y)) {
				attackMonster(player, monsters[i], newX, newY);
				if (monsters[i].health > 0) fail = true;
			}
		}
	}
	
	//need to loop through all monsters
	for (var i = 0; i < monsters.length; i++) {
		if (object == monsters[i]) {
			if ((player.health > 0) && (newX == player.x) && (newY == player.y)) {
				attackMonster(monsters[i], player, newX, newY);
				if (player.health > 0) return;
				if (player.health <= 0) {
					print('\rYou lost a pathetically simple game!');
				}
			}
		}
	}
	
	//don't monsters overlap
	for (var i = 0; i < monsters.length; i++) {
		for (var j = 0; j < monsters.length; j++) {
			if (i != j) {
				if (object == monsters[i]) {
					if ((newX == monsters[j].x) && (newY == monsters[j].y)) {
						return;
					}
				}
			}
		}
	}
	
	if (!fail) {
		object.x = newX; // set new position
		object.y = newY;
	}
	
	if (object == player) {
		fow();
		turn++;
		
		if (!fail) {
			camera.offsetX -= x;
			camera.offsetY -= y;
		}
		
		for (var i = 0; i < monsters.length; i++) {
			if ((current == player)&&monsters[i].health>0) {
				move(monsters[i], rand(-1,1), rand(-1,1));
			}
		}
	}
	
	if (lookMode) fow();
}

function fow() {
	for (var i = player.x - fowRange - 1; i < player.x + fowRange + 2; i++) { 
		for (var j = player.y - fowRange - 1; j < player.y + fowRange + 2; j++) { 
			var fog = fowMap[j][i];
			if (fog == 2) {
				fowMap[j][i] = 1;
			}
		} 
	} 
	
	for (var i = (player.x - fowRange); i < (player.x + fowRange + 1); i++) { 
		for (var j = (player.y - fowRange); j < (player.y + fowRange + 1); j++) { 
			var d = Math.floor(Math.sqrt((i - player.x)*(i - player.x) + (j - player.y)*(j - player.y)));
            if (d < fowRange) {
				//fowMap[j][i] = 2; 
				var wall = finalMap[j][i];
				raytrace(player.x, player.y, i, j, 2)
			}
		}
	}
	
	if (lookMode) {
		for (var i = player.x - fowRange - 1; i < player.x + fowRange + 2; i++) { 
			for (var j = player.y - fowRange - 1; j < player.y + fowRange + 2; j++) { 
				var fog = fowMap[j][i];
				if (fog == 3) {
					fowMap[j][i] = 2;
				}
			}
		}
	}
}

function isBlocking(object, x, y) {
	// first make sure that we cannot move outside the boundaries of the level
	//console.log('x ' + x + ' y ' + y);
	if (object == look) {
		if (y < 0 || y >= camera.size || x < 0 || x >= camera.size) {
			return true;
		} 
		} else {
		if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) {
			return true;
		}
	}
	
	// return true if the map block is not 0, ie. if there is a blocking wall.
	if (object != look) return (finalMap[Math.floor(y)][Math.floor(x)] !== 0);	
}

function drawMap() {
	var Map = $("map"); // the actual map
	var MapCtr = $("mapcontainer"); // the container div element
	var MapObjects = $("mapobjects"); // the canvas used for drawing the objects on the map (player character, etc)
	//var Spells = $("spell");
	var Stats = $("stats");
	
	Map.width = camera.size * MapScale; // resize the internal canvas dimensions 
	Map.height = camera.size * MapScale; // of both the map canvas and the object canvas
	MapObjects.width = Map.width;
	MapObjects.height = Map.height;
	//Spells.width = Map.width;
	//Spells.height = Map.height/4;
	Stats.width = 2*Map.width/5;
	Stats.height = Map.height;
	
	//draw 'blank' background
	var ctx = Map.getContext("2d");
	var objectCtx = MapObjects.getContext("2d");
	var stats = Stats.getContext("2d");
	
	stats.fillStyle = 'white';
	stats.font = '18px Monospace';
	stats.fillText('Turn ' + turn, 0,18); 
	stats.fillText(player.name, 0,18*2);
	stats.fillText('Experience ' + player.experience, 0,18*3); 
	stats.fillText('Health ' + player.health + '/' + player.maxhealth, 0,18*5);
	stats.fillText('You do ' + player.n + 'd' + player.s + ' damage', 0,18*6); 
	
	//ctx.save();
	ctx.translate(camera.offsetX*MapScale, camera.offsetY*MapScale);
	ctx.clearRect(-camera.offsetX*MapScale, -camera.offsetY*MapScale, Map.width, Map.height);
	
	//draw walls
	drawWalls(ctx)
	
	//draw actors
	//items
	for (i = 0; i < items.length; i++) {
			var x = items[i].x;
		var y = items[i].y;
		var fog = fowMap[y][x];
		
		if ((fog == 2) || (fog == 3)) {
			drawObject(items[i]);
		}
	}
	
	//monsters
	for (i = 0; i < monsters.length; i++) {
		var x = monsters[i].x;
		var y = monsters[i].y;
		var fog = fowMap[y][x];
		
		if ((fog == 2) || (fog == 3)) {
			drawObject(monsters[i]);
		}
	}
	
	//player (that's you!)
	if (player.health > 0) {
		objectCtx.drawImage(heroImage, (player.x + camera.offsetX) * MapScale, (player.y + camera.offsetY) * MapScale);
	}

	
	// draw the current look position
	drawLook(objectCtx);
	
	//draw spell menu
	//drawSpells();
}

/* function drawSpells() {
	var spell = document.getElementById('spell');
	
	var ctxspell = spell.getContext("2d");
	ctxspell.fillStyle = "#000000";
	ctxspell.fillRect(0, 0, MapScale, MapScale);	
} */

function clone(obj) {
	var target = {};
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			target[i] = obj[i];
		}
	}
	return target;
}

function genVar(count, i) {
	var myString = monsterTypes[i].name + count[i];
	window[myString] = clone(monsterTypes[i]);
	//myString = clone(monsterTypes[0]);
	//console.log(myString);
	monsters.push(window[myString]);
	count[i]++;
}

function place() {
	//need to add monsters to the monsters array
	
	var count = [];
	for (var i = 0; i < monsterTypes.length; i++) count[i] = 0;
	
	for (var i = 0; i < numMonsters; i++) {
		var r = Math.random();
		
		if (r < .5) {
			genVar(count, 0);
			} else if (r <.95) {
			genVar(count, 1);
			} else {
			genVar(count, 2);
		}
	}
	
	//need to place all monsters in the monsters array
	for (var i = 0; i < monsters.length; i++) {		
		
		var x = blanks/2;
		var y = x;
		var collision = 1;
		var monsterCollision = 1;
		
		//does not check monster collisions
		//		while ((collision > 0) && (monsterCollision > 0) && (player.x - x != 0 && player.y - y != 0)) {
		while ((collision != 0) || (monsterCollision != 0)) {
			x = (Math.floor((Math.random() * (finalMap[0].length - blanks)) + blanks/2));
			y = (Math.floor((Math.random() * (finalMap.length - blanks)) + blanks/2));
			//console.log(i);
			
			collision = finalMap[y - camera.offsetY][x - camera.offsetX];
			
			if (i == 0) {
				monsterCollision = 0;
				} else if (collision == 0) {
				var bool = true;
				for (var j = 0; j < i; j++) {
					//console.log('j');
					if (x == monsters[j].x && y == monsters[j].y) {
						//console.log('bad');
						bool = false;
						break;
					}
				}
				if (bool) monsterCollision = 0;
			}
			
			
		}
		
		monsters[i].x = x;
		monsters[i].y = y;
		//console.log(x, y);
	}
	
	var collision = 1;
	
	while ((collision != 0) || (monsterCollision != 0)) {
		var x = (Math.floor((Math.random() * (finalMap[0].length - blanks)) + blanks/2));
		var y = (Math.floor((Math.random() * (finalMap.length - blanks)) + blanks/2));
		collision = finalMap[y - camera.offsetY][x - camera.offsetX];
		
		
		if (i == 0) {
			monsterCollision = 0;
			} else if (collision == 0) {
			var bool = true;
			for (var j = 0; j < i; j++) {
				//console.log('j');
				if (x == monsters[j].x && y == monsters[j].y) {
					//console.log('bad');
					bool = false;
					break;
				}
			}
			if (bool) monsterCollision = 0;
		}
	}
	
	player.x = x;
	player.y = y;
	//console.log(player.x, player.y);		
	
	//center the player
	camera.offsetX = -player.x+Math.floor(mapWidth/8); 
	camera.offsetY = -player.y+Math.floor(mapHeight/8)-1;
	//console.log(camera.offsetX, camera.offsetY);
}

function genVar2(count, i, temp) {
	var myString = temp.name + count[i];
	window[myString] = clone(temp);
	//myString = clone(monsterTypes[0]);
	//console.log(myString);
	items.push(window[myString]);
	count[i]++;
}

function placeItems() {
	var icount = [];
	for (var i = 0; i < ITEM[1].length; i++) icount[i] = 0;
	
	for (var i = 0; i < numItems; i++) {
		var temp = getRandomItem(1);
		genVar2(icount, i, temp);		
	}
	
	//need to place all items in the items arrays
	for (var i = 0; i < items.length; i++) {		
		var x = blanks/2;
		var y = x;
		var collision = 1;
		
		while (collision != 0) {
			x = (Math.floor((Math.random() * (finalMap[0].length - blanks)) + blanks/2));
			y = (Math.floor((Math.random() * (finalMap.length - blanks)) + blanks/2));
			//console.log(i);
			
			collision = finalMap[y - camera.offsetY][x - camera.offsetX];
		}
		
		items[i].x = x;
		items[i].y = y;
		//console.log(x, y);
	}
	
}

function drawLook(objectCtx) {
	if (pathbool) pathOut(path);
	
	var Stats = $("stats");
	var stats = Stats.getContext("2d");
	var wall = finalMap[look.y - camera.offsetY][look.x - camera.offsetX];
	
	if (((look.x - camera.offsetX) == player.x)&&((look.y - camera.offsetY) == player.y)) { 
		var lookPlayer = true;
		} else {	
		for (var i = 0; i < monsters.length; i++) {
			if (((look.x - camera.offsetX) == monsters[i].x)&&((look.y - camera.offsetY) == monsters[i].y)) { 
				var lookMonster = true;
				var lookname = monsters[i].name;
				var lookhealth = monsters[i].health;
				var lookmaxhealth = monsters[i].maxhealth;
				var looks = monsters[i].s;
				var lookn = monsters[i].n;
			}
		}
	}
	
	if (lookMode) {
		objectCtx.fillStyle = "rgba(0,0,0,.2)";
		objectCtx.fillRect(look.x * MapScale, look.y * MapScale, MapScale, MapScale);
		objectCtx.fillStyle = 'black';
		objectCtx.font = '12px Monospace';
		objectCtx.fillText((look.x - camera.offsetX) + ', ' + (look.y - camera.offsetY), look.x * MapScale, look.y * MapScale); // just to show where we are drawing these things
		
		if (lookPlayer) {
			stats.fillText('This is you, dipshit.', 0,18*13);
			} else if (lookMonster) {
			stats.fillText(lookname, 0,18*13);
			stats.fillText('Health ' + lookhealth + '/' + lookmaxhealth, 0,18*15);
			stats.fillText(lookname + ' does ' + lookn + 'd' + looks + ' damage', 0,18*16); 
			} else if (wall == 0) {
			stats.fillText('This is the ground.', 0,18*13); 
			} else if (wall == 1) {
			stats.fillText('This is a wall.', 0,18*13); 
			} else if (wall == 9) {
			stats.fillText('This is an impenetrable wall.', 0,18*13); 
		}
		
		if (((prevx == look.x) && (prevy == look.y)) || ((player.x == (look.x - camera.offsetX)) && player.y == (look.y - camera.offsetY))) {
			//nada
			} else {
			raytrace(player.x, player.y, (look.x - camera.offsetX), (look.y - camera.offsetY), 3);
			grid = new PF.Grid(finalMap[0].length, finalMap.length, finalMap);
			path = finder.findPath(player.x, player.y, (look.x - camera.offsetX), (look.y - camera.offsetY), grid);
			//console.log('p ' + player.x + ' ' + player.y);
			//console.log('l ' + (look.x - camera.offsetX) + ' ' + (look.y - camera.offsetY));
		}
	}
	
	prevx = look.x;
	prevy = look.y;
}



function pathOut(path) {
	var ex, why;
	//console.log('----------');
	var z = 1, length = path.length; 
	var hope =	setInterval(function() {
		ex = path[z][0];
		why = path[z][1]; 
		//console.log(ex + ' ' + why);
		move(player, ex - player.x, why - player.y);
		//console.log('moved');
		z++;
		if (z >= length) clearInterval(hope);
	}, 100);
	
	pathbool = false;
	lookMode = false;
	bind();
}

function drawWalls(ctx) {
	for (var y = 0; y < mapHeight; y++) {
		for (var x = 0; x < mapWidth; x++) {
			var wall = finalMap[y][x];
			var fog = fowMap[y][x];
			
			if (wall == 0) {
				var randmap = randMap[y][x];
				//ground
				//ctx.fillStyle = "#D1D1D1";
				//ctx.fillRect(
				//x * MapScale, y * MapScale, MapScale, MapScale);
				ctx.drawImage(dirt[randmap], x * MapScale, y * MapScale);
				} else if (wall > 0) {
				var randgmap = randgMap[y][x];
				//wall
				//ctx.fillStyle = "#666666";
				//ctx.fillRect(
				//x * MapScale, y * MapScale, MapScale, MapScale);
				ctx.drawImage(vine[randgmap], x * MapScale, y * MapScale);
				} else if (wall == 9) {
				//outerbounds
				ctx.fillStyle = "#000000";
				ctx.fillRect(
				x * MapScale, y * MapScale, MapScale, MapScale);
			}
			
			if (fog == 0) {
				//have not seen
				ctx.fillStyle = "rgba(0, 0, 0, 1)";
				ctx.fillRect(
				x * MapScale, y * MapScale, MapScale, MapScale);				
				} else if (fog == 1) {
				//have seen
				ctx.fillStyle = "rgba(0,0,0,0.5)";
				ctx.fillRect(
				x * MapScale, y * MapScale, MapScale, MapScale);
				} else if (fog == 2) {
				//currently looking at
				//draw nothing
				} else if (fog == 3) {
				//have seen
				ctx.fillStyle = "rgba(255,255,0,0.15)";
				ctx.fillRect(
				x * MapScale, y * MapScale, MapScale, MapScale);
			} 
		}
	}
}

function drawObject(object) {
	var MapObjects = $("mapobjects");
	var objectCtx = MapObjects.getContext("2d");
	
	if (object.health > 0 || object == items) {
		objectCtx.drawImage(object.image,
		(object.x + camera.offsetX) * MapScale, (object.y + camera.offsetY) * MapScale);
		//objectCtx.fillStyle = object.color;
		//objectCtx.fillRect(
		//(object.x + camera.offsetX) * MapScale, (object.y + camera.offsetY)  * MapScale, MapScale, MapScale);
	} else if (object.health == null) {
		objectCtx.drawImage(object.image,
		(object.x + camera.offsetX) * MapScale, (object.y + camera.offsetY) * MapScale);
	} 	
}

function attackMonster(attacker, victim, newX, newY) {
	attack(attacker.n, attacker.s, attacker.c);
	victim.health -= damage;
	if (victim.health > 0) {
		print('\r' + attacker.name + ' ' + hit[rand(0,hit.length)] + 's ' + victim.name + ' for ' + damage + ' damage! ' + victim.name + ' has ' + victim.health + ' health.');
	}
	if (victim.health <= 0) {
		print('\r' + attacker.name + ' ' + hit[rand(0,hit.length)] + 's ' + victim.name + ' for ' + damage + ' damage! ' + victim.name + ' dies a ' + horrible[rand(0,horrible.length)] + ' death.');
	}
	if (victim.health <= 0) {
		console.log('ded');
		//should remove the object from the array and provide experience to player here
		attacker.experience += victim.experience;
	}
}

function attack(N, S, C) {
	damage = rollDice(N, S);
	if (Math.floor((Math.random() * 100) + 1) <= C) {
		damage += rollDice(N, S);
	}
}

function rollDice(N, S) {
	value = 0;
	for (i = 0; i < N; i++) {
		value += Math.floor((Math.random() * S) + 1);
	}
	return value;
}

//a not shitty random function
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function print(text) {
	textbox.value += text
	textbox.scrollTop = textbox.scrollHeight;
}


//los check
function raytrace(x0, y0, x1, y1, num) {
	var arr = [];
	var toDrawX = [];
	var toDrawY = [];
	var wall;
	
	var dx = Math.abs(x1-x0);
	var dy = Math.abs(y1-y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx-dy;
	
	while(true){
        fowMap[y0][x0] = num;
		toDrawX.push(x0);
		toDrawY.push(y0);
		
		wall = finalMap[y0][x0];
		arr.push(wall);
		
		if (wall == 1) break;
		
		if ((x0==x1) && (y0==y1)) break;
		var e2 = 2*err;
		if (e2 >-dy){ err -= dy; x0  += sx; }
		if (e2 < dx){ err += dx; y0  += sy; }
	}
}

init();										