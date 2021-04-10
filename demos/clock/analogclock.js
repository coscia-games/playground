/*
Loader Script
If script is being accessed by loader.html, this will create the elements
on the page. Otherwise, this script is ignored.
*/
try {
	// Check if the loader is calling this script, and change its title to the script's saved title.
	document.getElementById("loadingScreen").id = "title";
	var h1 = document.createElement("h1");
	h1.id = "header";
	h1.style.cssText = "padding:10px 10px; font-size:6em; color:green; " +
	"margin:auto; text-align:center; text-decoration:underline";
	document.body.append(h1);
	var canv = document.createElement("canvas");
	canv.id = "board";
	canv.width = 400;
	canv.height = 400;
	canv.style.cssText = "margin:auto; display:block;";
	document.body.append(canv);
}
catch (TypeError) {}

// Begin Canvas Drawing
var canvas = document.getElementById("board");
var context = canvas.getContext("2d");


//Creates new date object.
function getDate() {
	var date = new Date();
	return date;
}

/*
Creates insertable text node with date object's time string as value.
If one already exists in the document, overwrites value with current date object's time string.
*/

function createTimeStamp() {
	try {
		document.getElementById("timestamp").innerHTML = getDate().toLocaleTimeString();
	}
	catch (err) {
		var div = document.createElement("div");
		var time = document.createTextNode(getDate().toLocaleTimeString());
		div.id = "timestamp";
		div.appendChild(time);
		div.style.margin = "auto";
		div.style.textAlign = "center";
		div.style.fontSize = "2em";
		document.body.append(div);
	}
}

//Updates the timestamp div inserted by createTimeStamp.
setInterval(function() { createTimeStamp() }, 1000);


var radius = canvas.height / 2;
context.translate(radius, radius);
radius = radius * 0.9;

//Draws the clock and updates the hands by fetching new date object every second.
setInterval(function() { updateClock(getDate()); }, 1000);

//Draws the clock face, then updates hands based on values of date object's time string.
function updateClock(d) {
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	var ang;
	
	//Redraw clock to erase old hands.
	drawClock();
	
	//Draw Hour Hand
	context.beginPath(); //Starts the hand drawing.
	ang = ((hour % 12) * Math.PI / 6) + (min * Math.PI / 360) + (sec * Math.PI / 21600);
	context.lineWidth = radius*0.05;
	context.lineCap = "round";
	context.strokeStyle = "#27302f";
	context.moveTo(0,0); //Starts the hand at the center.
	context.rotate(ang); //Turns the clock so the hand will be drawn vertically.
	context.lineTo(0,-radius*0.35); //Puts the end of the hand 'y' pixels away from the center.
	context.stroke(); //Creates line from center to 'y' pixels away vertically.
	context.rotate(-ang); //Turns the clock back to normal.
	
	//Draw Minute Hand
	context.beginPath();
	ang = (min * Math.PI / 30) + (sec * Math.PI / 1800);
	context.lineWidth = radius*0.03;
	context.strokeStyle = "#41504f";
	context.moveTo(0,0);
	context.rotate(ang);
	context.lineTo(0,-radius*0.7);
	context.stroke();
	context.rotate(-ang);
	
	//Draw Second Hand
	context.beginPath();
	ang = sec * Math.PI / 30;
	context.lineWidth = radius*0.02;
	context.strokeStyle = "#607574";
	context.moveTo(0,0);
	context.rotate(ang);
	context.lineTo(0,-radius*0.85);
	context.stroke();
	context.rotate(-ang);
}

//Draws the base clock face that doesn't change over time.
function drawClock() {
	//Draws Base of the clock.
	context.beginPath(); //Starts the path needed to create the base of the clock
	context.arc(0, 0, radius, 0, 2*Math.PI); //Creates closed surface, circle of radius
	context.fillStyle = "#abbab9";
	context.fill(); //Fills the closed surface made above
	
	//Draws the rim around the clock
	rim = context.createRadialGradient(0, 0, radius*0.95, 0, 0, radius*1.05);//Radial Gradient from just inside the surface to just outside the surface
	rim.addColorStop(0, "#747f7e");
	rim.addColorStop(0.5, "white");
	rim.addColorStop(1, "#747f7e");
	context.strokeStyle = rim;
	context.lineWidth = radius*0.1;
	context.stroke(); //Draws the path of the closed surface, using the rim as the style of the stroke
	
	//Draws the center of the clock.
	context.beginPath();
	context.arc(0,0,radius*0.1,0,2*Math.PI);
	context.fillStyle = "#4c5d5b";
	context.fill();
	
	//Draws the numbers around the clock.
	var ang;
	var num;
	context.font = radius*0.15 + "px arial";
	context.textBaseline="middle";
	context.textAlign="center";
	for(num = 1; num < 13; num++){
		ang = num * Math.PI / 6;
		context.rotate(ang);
		context.translate(0, -radius*0.85);
		context.rotate(-ang);
		context.fillText(num.toString(), 0, 0);
		context.rotate(ang);
		context.translate(0, radius*0.85);
		context.rotate(-ang);
	}
}