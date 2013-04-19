/*--------------------------------------------
	Armour
--------------------------------------------*/
var leatherImage = new Image(); 	leatherImage.src = 		"img/items/armour/leather_armour1.png";

var armourTypes = [

leather = {
	name: "Leather Armour",
	color: "#C0C0C0",
	image: leatherImage,
	x: 40,
	y: 40,
	weight: 3,
	bonus: 10
}

];

var armour = [

];


/*--------------------------------------------
	Weapons
--------------------------------------------*/
var daggerImage = new Image(); 	daggerImage.src = 		"img/items/weapon/dagger.png";


var weaponTypes = [

dagger = {
	name: "Dagger",
	color: "#585858",
	image: daggerImage,
	x: 41,
	y: 40,
	damage: 6,
	db: 1,
	hb: 2
}

];

var weapon = [

];

/*--------------------------------------------
	Misc
--------------------------------------------*/
var goldImage = new Image(); 	goldImage.src = 		"img/items/misc/gold_pile.png";

var miscTypes = [

gold = {
	name: "Gold",
	color: "#978616",
	image: goldImage,
	x: 41,
	y: 40,
	amount: 1
}

];

var misc = [

];

var items = [

];

var ITEM = {
    1: [
	//["name",      	var,     weight] 
	["Leather Armour",	leather, 20],
	["Dagger",   		dagger,  10],
	["Gold",  			gold,    55]
	],
	
    2: [
	//["name",      	var,     weight] 
	["Gold",  			gold,    55]
	],
	
	
};

function getRandomItem(level) {
    var itemForLevel = ITEM[level];
    var itemTotalWeight = 0, itemCumWeight = 0, i;
    // sum up the weights
    for (i = 0; i < itemForLevel.length; i++) {
        itemTotalWeight += itemForLevel[i][2];
	}
    var random = Math.floor(Math.random() * itemTotalWeight);
    // now find which bucket out random value is in
	
    for (i = 0; i < itemForLevel.length; i++) {
        itemCumWeight += itemForLevel[i][2];
        if (random < itemCumWeight) {
			//if we've found gold we randomly generate an amount
			if (itemForLevel[i][0] == "Gold") {
				gold.amount = rand(level, level * 100);
			}
			return(itemForLevel[i][1]);
		}
	}
}

var numberFloorTiles = String(finalMap).replace(/[^0]+/g,'').length;
var itemConcentration = 1 / 50;
var numItems = Math.round(numberFloorTiles * itemConcentration);