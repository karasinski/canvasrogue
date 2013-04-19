/*--------------------------------------------
	How many monsters should we stick in this map?
--------------------------------------------*/
//how many 0s are in finalMap? Now with less for loops!
var numberFloorTiles = String(finalMap).replace(/[^0]+/g,'').length;
var monsterConcentration = 1 / 20;
var numMonsters = Math.round(numberFloorTiles * monsterConcentration);
//console.log(numMonsters);

var ratImage = new Image(); 	ratImage.src = 		"img/monsters/rat.png";
var spiderImage = new Image();	spiderImage.src = 	"img/monsters/spider.png";
var dragonImage = new Image(); 	dragonImage.src = 	"img/monsters/dragon.png";

var monsterTypes = [

rat = {
	name: "Rat",
	color: "#00CE34",
	image: ratImage,
	x: 48,
	y: 51,
	n: 2,
	s: 4,
	c: 10,
	health: 15,
	maxhealth: 15,
	experience: 10
},

spider = {
	name: "Spider",
	color: "#FF4949",
	image: spiderImage,
	x: 36,
	y: 35,
	n: 2,
	s: 6,
	c: 10,
	health: 20,
	maxhealth: 20,
	experience: 25
},

dragon = {
	name: "Dragon",
	color: "#FF00FF",
	image: dragonImage,
	x: 40,
	y: 40,
	n: 3,
	s: 6,
	c: 10,
	health: 50,
	maxhealth: 50,
	experience: 100
}

];

var monsters = [

];