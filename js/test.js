/* Document based script */
// Window height and width
(function($) { 
	var wwidth,wheight,ctx,linearray,mouseX,mouseY,hoverbutton = false,buttonX,buttonY;
	var fps = 0, now, lastUpdate = (new Date)*1 - 1;
	var fpsFilter = 50;
	
	function canvasDraw(){
		ctx = null;
		wwidth = $(window).width();
		wheight = $(window).height();
		
		c = document.getElementById("lines");

		// Get the 2D graphic context to the canvas
		ctx = c.getContext("2d");

		// Set the height and width of the canvas
		c.height = wheight;
		c.width = wwidth;
	}

	// Core 
	$(document).ready(function(){
		canvasDraw();
		lineArray = lineFactory(wheight,wwidth);
		drawFrame();
	});

	function drawFrame(){
		ctx.clearRect(0, 0, c.width, c.height);
		screenbuilder(lineArray);
		
		// FPS calculator
		var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
		fps += (thisFrameFPS - fps) / fpsFilter;
		lastUpdate = now;
		fps = Math.round(fps*100)/100;
		
		setTimeout(drawFrame,fps);
	}
		
	var linewidth = 35;
	var lineheight = 35;
	var linesize = 2;

	// LineFactory, creates the array with lines
	function lineFactory(height,width){
		linearray = new Array();

		for(var y = 0;y <= height/lineheight+1;y++){
			var linerow = new Array();
			
			for(var x = 0;x <= width/linewidth;x++){
				linerow[x] = new line(linewidth,lineheight,x,y,linesize,x+y);
			}
			
			linearray[y] = linerow;
		}
		return linearray;
	}

	// Draw on screen
	function screenbuilder(lines){
		for(var y = 0; y < lines.length; y++){
			for(var x = 0; x < lines[y].length; x++){
				line = lineOptions(lines[y][x]);
				line.draw();
			}	
		}
	}

	var wiggle,fade,magnet,wave,colorwave,colorwave_color,speed;
	
	$(document).ready(function(){
		wiggle = $("#lines").data('colorwiggle');
		fade = $("#lines").data('colorfade');
		magnet = $("#lines").data('magnetmouse');
		wave = $("#lines").data('wave');
		colorwave = $("#lines").data('colorwave');
		colorwave_color = $("#lines").data('colorwavecolor');
		speed = $("#lines").data('speed');
	});
	
	// Add options to the lines
	function lineOptions(line){
		
		line.setColorWiggle(wiggle);
		line.setColorFade(fade);
		line.setMagnetMouse(magnet,mouseX,mouseY);
		line.setWave(wave,true);
		line.setColorWave(colorwave,colorwave_color);
		line.setSpeed(speed);
	/*	
		line.setColorWiggle($("#lines").data('colorwiggle'));
		line.setColorFade($("#lines").data('colorfade'));
		line.setMagnetMouse($("#lines").data('magnetmouse'),mouseX,mouseY);
		line.setWave($("#lines").data('wave'),$("#lines").data(''));
		line.setColorWave($("#lines").data('colorwave'),$("#lines").data(''));
*/
		
		if(hoverbutton){
			line.setMagnetMouse(true,buttonX,buttonY);
			line.setColorWave(false,false);
		}
		
		return line;
	}

	$(document).mousemove(function(event){
		mouseX = event.clientX;
		mouseY = event.clientY;		
	});


	$(window).resize(function(){
		canvasDraw();
		lineFactory();
		screenbuilder();
	});
	
	/* Line object */
	function line(width,height,x,y,size,colortemp){
	
		var obj = this;
		
		obj.width = width;
		obj.height = height;
		obj.color = "grey";
		obj.size = size;
		obj.x = x;
		obj.y = y;
		obj.endDeg = 0;
		obj.startDeg = 0;
		obj.currentDeg = 0;
		obj.turnSpeed = 0.1;
		obj.startPos = true;
		obj.turning = false;
		obj.stopped = false;
		obj.goingBack = false;
		obj.goingForward = false;
		obj.wave = false;
		obj.moveTo = 0;
		obj.colorFade = false;
		obj.colorWiggle = false;
		obj.magnetMouse = false;
		obj.waveStandard = true;
		obj.colorWaveMove = false;
		obj.colorWaveColor = false;
		obj.colorTempAngle = colortemp;
		obj.pointToPos = false;
		obj.animate = false;
		obj.speed = 0.025;
		
		var color = 100;
		var counter = 0;
		var newdeg = 0;
		var reverse = false;
		var testc = 0;
		
		obj.draw = function(){
			counter++;
			if(obj.colorWaveColor == true){
				obj.colorTempAngle += obj.speed;
			}
			
			// Check if colorFade is on
			if(obj.colorFade){				
				if(color <= 100){
					newcolor = -4;
				}
				else if(color >= 150){
					newcolor = 4;
				}
				color -= newcolor
				obj.color = "rgb("+color+","+color+","+color+")";
			}
			
			// color wave
			if(obj.colorWaveColor || obj.colorWaveMove){
				var greyalpha = Math.abs(Math.round(50+(150*Math.cos(obj.colorTempAngle))));
				
				obj.size = greyalpha/100;
				if(obj.colorWaveMove) obj.animateTo(greyalpha*(Math.PI/180));
				if(obj.colorWaveColor) obj.color = "rgba("+greyalpha+","+greyalpha+","+greyalpha+",1)";
			}
			
			// Wave
			if(obj.wave){
				if(counter > 25){
					counter = -25;
					reverse = (reverse) ? false : true;
				}
				newdeg = (reverse) ? +0.01 : -0.01; 
				
				if(obj.waveStandard){
					obj.currentDeg = (obj.x%2 == 0) ? obj.currentDeg -= newdeg : obj.currentDeg += newdeg;
				}
				else{
					obj.currentDeg = (obj.y%2 == 0) ? obj.currentDeg -= newdeg : obj.currentDeg += newdeg;
				}
			}
			
			// Color wiggle
			if(obj.colorWiggle){
				obj.color = "rgb("+Math.floor((Math.random()*255)+1)+","+Math.floor((Math.random()*255)+1)+","+Math.floor((Math.random()*255)+1)+")";
			}
			
			// Draw on canvas
			ctx.save();
			ctx.beginPath();
			ctx.translate((obj.x*obj.width)+(obj.width/2),(obj.y*obj.height)+(obj.width/2));
			ctx.rotate(obj.currentDeg);
			ctx.moveTo((obj.width/2), 0);
			ctx.lineTo(-(obj.width/2), 0);
			ctx.strokeStyle = obj.color;
			ctx.lineWidth = obj.size;
			ctx.stroke();
			ctx.restore();
		}
		
		obj.setEnd = function(deg){
			obj.endDeg = deg;
		}
		
		obj.setStart = function(deg){
			obj.startDeg = deg;
		}
		
		obj.setCurrent = function(deg){
			obj.currentDeg = deg;
		}
		
		obj.moveToDeg = function(deg){
			obj.moveTo = deg;
		}
		
		obj.setColorFade = function(value){
			obj.colorFade = value;
		}
		
		obj.setColorWiggle = function(value){
			obj.colorWiggle = value;
		}
		
		obj.setSpeed = function(value){
			obj.speed = value;
		}
		
		obj.setMagnetMouse = function(value,mouseX,mouseY){
			obj.magnetMouse = value;
			
			if(value == true){
				x = (obj.x*obj.width);
				y = (obj.y*obj.height);
								
				dx = mouseX - x;
				dy = mouseY - y;
							 
				a = Math.atan2(dy,dx);
					
				obj.animateTo(a);
			}
		}
		
		obj.goBack = function(){
			obj.stopped = true;
			obj.turning = true;
			obj.goingForward = false;
			obj.goingBack = true;
		}
		
		obj.stop = function(){
			obj.turning = false;
			obj.goingBack = false;
			obj.goingForward = false;
		}
		
		
		obj.setWiggle = function(){
			obj.wiggle = true;
		}
		
		obj.setWave = function(value,standard){
			obj.wave = value;
			obj.waveStandard = standard;
		}
		
		obj.setColorWave = function(move,color){
			obj.colorWaveMove = move;
			obj.colorWaveColor = color;
		}
		
		obj.animateTo = function(a){
			if(Math.abs(obj.currentDeg - a) > 0.1){
				if(obj.currentDeg * 100 < (a * 100-1)){
				obj.currentDeg += 0.2;
				}
				if(obj.currentDeg * 100 > (a * 100+1)){
					obj.currentDeg -= 0.2;
				}
			}
			else{
				obj.currentDeg = a;
			}
		}
	}
})(jQuery);
