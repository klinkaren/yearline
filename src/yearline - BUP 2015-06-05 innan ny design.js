$(document).ready(function() {
    'use strict';   
    // ### Put this in other document
    $('.yearline1').yearline({
    	color:'#fff', 
    	backgroundColor:'#fff',
    	width: 100,
    	height: 500,
    	borderRadius: 20
    });
    /*
    $('.easytimeline2').easytimeline({
    	color:'#000', 
    	backgroundColor:'#ccc',
    	width: 400,
    	height: 400,
    	borderRadius: 10
    });
		$('.easytimeline3').easytimeline({
    	color:'#000', 
    	backgroundColor:'#ccaacc',
    	width: 500,
    	height: 100,
    	borderRadius: 10
    });
*/
});

(function($, window, document) {
	var timelines = new Array(),
	settings,
	datastore;
  /* http://ejohn.org/blog/fast-javascript-maxmin/
	  Array.max = function( array ){
	      return Math.max.apply( Math, array );
	  };
	  Array.min = function( array ){
	      return Math.min.apply( Math, array );
	  };
	*/

  /**
   * Support function to sort timeline array by year.
   * Source: http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-property-value-in-javascript
	 */
	function compareYear(a,b) {
	  if (a.year < b.year)
	    return -1;
	  if (a.year > b.year)
	    return 1;
	  return 0;
	}

	function addGoogleFont(FontName) {
	    $("head").append("<link href='https://fonts.googleapis.com/css?family=" + FontName + "' rel='stylesheet' type='text/css'>");
	}

	function Plugin(div, options) {
	  // Variables
	  settings = $.extend({
      // These are the defaults.
      color: "#556b2f",
      backgroundColor: "white",
      width: 300,
      height: 500,
      borderRadius: 10,
      font: "Roboto",
    }, options ),
	  this.div = div,
	  settings.timelineWidth = 80,	  
		addGoogleFont(settings.font);

		// Set minimim height and width.
	  if (settings.height < 300) settings.height =300;
	  if (settings.width < 400)  settings.width =400;
	  
	  this.init();
	}
	Plugin.prototype = {

		init: function() {
			var source = $(this.div),
					timeline;

			datastore = this.extractData(source);
			source.text(""); // Clean div
			this.createWorkspace(source);
			this.from = datastore[0].year;
			this.to 	= datastore[datastore.length-1].year;
			timelines.push(new Timeline(this.from, this.to));
			console.log("numTimelines "+timelines.length);
			//console.log(datastore[0].title);
	    //datastore.push(new Data('2000', 'Min titel', 'Min text'));
	    //console.log('were in! ' + this.settings.color + ", " + datastore[0].title + "\n" + source.text());
		},

		/**
		 * Retrieve data from source and return in array
		 */
		extractData: function(source) {
			var cleanData 		= new Array(),
					rawData = new Array();

			// Extract all lines to array
			rawData = source.text().split(/\n/);

			// remove first and last element
			rawData.shift();
			rawData.pop();

			// trim whitespace from array elements
	   	rawData = rawData.map(function(entry){ return entry.trim(); });  

			// remove empty lines
			rawData = rawData.filter(Boolean);

			// 
    	for (var i=0; i<rawData.length; ++i) {
	      
	      if (rawData[i] == '***'){
	      	// console.log("found start at "+i);
	      	if(rawData[i+4] != '***'){
	      		// if category has been added
	      		cleanData.push(new Data(rawData[i+1], rawData[i+2], rawData[i+3], rawData[i+4]));
	      	} else {
	      		// if no category
	      		cleanData.push(new Data(rawData[i+1], rawData[i+2], rawData[i+3]));
	      	}
	      }
	    }

	    // Sort data by year
	    cleanData.sort(compareYear);
			
			return cleanData;
		},

		createWorkspace: function(source) {
     
      // Add wrapper
      $( "<div id='timelineWrapper'></div>" ).css({
          'width': settings.width,
          'height': settings.height,
          'position' : 'relative',
          'font-family': settings.font,
      }).appendTo(source);

   		// Add canvas
      $( "<canvas id='timelineCanvas' width='" + settings.timelineWidth + " px' height='" + settings.height + " px'></canvas>" ).appendTo($( "#timelineWrapper" ));
      canvas = document.getElementById('timelineCanvas');					
      ct 				= canvas.getContext('2d');												

      // Add datafield
      $( "<div id='datafield'></div>" ).css({
          'width'			: settings.width-settings.timelineWidth,
          'height'		: settings.height,
          'position'	: 'absolute',
          'left'		  : settings.timelineWidth,
          'top'				: 0,
      }).appendTo(timelineWrapper);         
		},
	}

  /**
	 * easytimeline data
	 */
	function Data(year, title, text, importance) {
	  this.year   		= year 				|| 1900;
	  this.title			= title 			|| 'No title';
	  this.text 			= text 				|| 'No text';
	  this.importance = parseInt(importance) 	|| 3;
	}	   
	Data.prototype = {
	}

	/**
	 * All objects are Vectors
	 */
	function Vector(x, y) {
	  this.x = x || 0;
	  this.y = y || 0;
	}
	Vector.prototype = {
	  muls:  function (scalar) { return new Vector( this.x * scalar, this.y * scalar); }, // Multiply with scalar
	  imuls: function (scalar) { this.x *= scalar; this.y *= scalar; return this; },      // Multiply itself with scalar
	  adds:  function (scalar) { return new Vector( this.x + scalar, this.y + scalar); }, // Multiply with scalar
	  iadd:  function (vector) { this.x += vector.x; this.y += vector.y; return this; }   // Add itself with Vector
	}

	/**
	 * Will hold start and end when zooming in on timeline. 
	 * Save theese as array and push/pop when zooming in/out.
	 */
	function Zoom(from, to, numYears) {
		this.from = from;
		this.to 	= to;
		this.numYears = numYears;
		this.span = Math.ceil( (to-from) / numYears);
		console.log('Added zoom: '+ this.from +"-"+ this.to + ". Span = " + this.span + " with " + this.numYears + " years");
	}
	Zoom.prototype = {
		// Nothing at the moment.
	}

	// Takes in CENTER POSITION of magnifier.
	function Magnifier(x, y) {
		this.radius = 6;
		this.lineWidth = 2;
		this.width = this.radius*2+this.lineWidth;
		this.height = this.radius*2+this.lineWidth;
		this.colour = "#000";
		this.backgroundColor = "white";
		this.position = new Vector(x-this.radius,y-this.radius);
		this.firstYear;
		this.lastYear;
		// console.log('Magnifier added at: '+this.position.x+", "+this.position.y);
	}
	Magnifier.prototype = {
		draw: function() {
			ct.save();
			ct.beginPath();
			ct.translate(this.position.x+this.radius, this.position.y+this.radius)
      ct.arc(0,0, this.radius, 0, 2 * Math.PI, false);
      ct.fillStyle = 'white';
      ct.fill();
      ct.lineWidth = this.lineWidth;
      ct.strokeStyle = 'black';
      ct.stroke();

      ct.beginPath();
      ct.moveTo(0, -this.radius/2);
      ct.lineTo(0, this.radius/2);
      ct.moveTo(-this.radius/2, 0);
      ct.lineTo(this.radius/2, 0);
      ct.strokeStyle = '#000',
      ct.lineWidth = 2,
      //ct.lineCap = 'round';
      ct.stroke();

      ct.restore();
		},
		setFirstYear: function(year) {
			this.firstYear = year;
		},
		setLastYear: function(year) {
			this.lastYear = year;
		},
	}

	function Minimizer(size) {
		this.position = new Vector(5,5);
		this.width = size*2+2;
		this.height = size*2+2;
		this.show = false;
	}
	Minimizer.prototype = {
		setShow: function(bool){
			this.show = bool;
		},
	}

	/**
	 * Extends Array prototype for timelines.pop. Makes pop prepare and show timeline of the new last element.
	 */ 
	timelines.pop = function(element) {
		console.log("Removed timeline");
		timelines[timelines.length-2].addEventListeners();
		timelines[timelines.length-2].draw();
		return Array.prototype.pop.apply(this);
	}

	function Timeline(from, to) {
	  this.numYears,	// number of years to show to left of timeline
		this.yearSpan,	// span between numYears
		this.zoom 				= new Array(); // Array for holding start and end years when zooming in and out.
		this.startYear	  = from,
		this.endYear			= to,
		this.rowHeight  	= 50,
		this.lineAt				= 70,
		this.lineWidth		= 3,
		this.holderWidth 	= 5,
		this.magnifiers 	= new Array(),
		this.minimizer 		= new Minimizer(10),
		this.headlineHeight = 16,
		this.init();
	}
	Timeline.prototype = {
		init: function() {
			if (timelines.length > 0) this.minimizer.setShow(true);
			//console.log('Added timeline: ' + this.startYear +"-"+this.endYear);
			this.numYears = Math.ceil(settings.height / this.rowHeight);
			this.yearSpan = (this.endYear- this.startYear) / (this.numYears-1);
			//this.zoom.push(new Zoom(datastore[0].year, datastore[datastore.length-1].year, this.numYears));
			this.addZoomObjects();
			this.addEventListeners();
			this.draw();
		},

		addDataElements: function() {
	
			// Clear datafield
			var emptyMe = document.getElementById('datafield');
			while( emptyMe.hasChildNodes() ){
			    emptyMe.removeChild(emptyMe.lastChild);
			}

			// Add data elements if within range
			for (var i=0; i<datastore.length; ++i) {
				if (datastore[i].year >= this.startYear && datastore[i].year <= this.endYear){
					//console.log(datastore[i].year);

					// Where to place div (vertical)
					percentDown = (this.endYear-datastore[i].year)/(this.endYear-this.startYear);
					timelinePx = settings.height-this.rowHeight;
					y = this.rowHeight/2+(timelinePx*percentDown)-this.headlineHeight;
					//y = Math.ceil(y);

					// Place div
					$("<div class='timelineEvent'>"+
							"<div class='timelineHeading'>"+
								datastore[i].year+": "+datastore[i].title+
							"</div>"+
							"<div class='timelineText timelineHiddenObject'>"+
								datastore[i].text+
							"</div>"+
						"</div>").css({
							'top' 		: Math.floor(y),
							//'z-index'	: +(99 - datastore[i].importance),
						}).addClass("timelineCat"+datastore[i].importance).appendTo(datafield);

					// Place line from timeline to DataElement. 
						ct.save();
			      ct.translate(this.lineAt, Math.floor(y+this.headlineHeight)+.5);
			      ct.beginPath();
			      ct.moveTo(0, 0);
			      ct.lineTo(10, 0);
			      ct.strokeStyle = '#000',
			      ct.lineWidth = 1;
			      ct.stroke();
			      ct.restore();	
				}

			}

      $(".timelineEvent").css({
      	'position' 				: 'absolute',
      	'left' 						: 0,
      	'padding'					: '0px',
      	'font-size' 			: this.headlineHeight-2+'px',
      	'line-height'			: this.headlineHeight+'px',
      }); 

      // When clicking on a timeline event
      $(".timelineEvent").click(function(){
      	$('.timelineText').addClass("timelineHiddenObject");
      	$('.timelineEvent').removeClass("timelineBringToFront");
      	$(this).children(".timelineText").toggleClass("timelineHiddenObject");
      	$(this).toggleClass("timelineBringToFront"); 
      });

		},
		addZoomObjects: function() {
			if (this.yearSpan >=5){	
				// Add magnifiers
		    for (var i=0; i<this.numYears-1; ++i) {
		    	this.magnifiers.push(new Magnifier(this.lineAt,i*this.rowHeight+this.rowHeight));
		    	console.log("Magnifier "+i+" at "+ this.magnifiers[i].position.x + ", "+this.magnifiers[i].position.y);
				}
				this.setMagnifiersYear();
			}
		},
		addEventListeners: function(){
			//console.log('addEventListeners');
			var self = this, // Capturing "this" into a local variable to be able to reach in function
					hasMinimizeListener = false;
					hasMagnifyListeners = false
			// Set option to show minimizer to true if more than 1 timeline (if zoomed in).
    	if(this.minimizer.show){
    		//console.log("showing minimizer");
    		hasMinimizeListener = true;
    		function minimizeClick(event) { 
		    	var offsetLeft = $(this).offset().left,
		    			offsetTop  = $(this).offset().top,
		    			x = event.pageX - offsetLeft,
		        	y = event.pageY - offsetTop,
							clicked = false;

	    		if(self.minimizer.show){
						if (y > self.minimizer.position.y && y < self.minimizer.position.y + self.minimizer.height 
		          && x > self.minimizer.position.x && x < self.minimizer.position.x + self.minimizer.width) {

							//console.log("Clicked minimizer!");
							clicked = true;

						}
			    }
		    	if (clicked) {
		    		// Remove eventlisteners
	        	canvas.removeEventListener('click', minimizeClick);
						if (hasMagnifyListeners) canvas.removeEventListener('click', magnifyClick);

						// Pop yearline
	        	timelines.pop();

        	}
			  }

		    // Add event listener
				canvas.addEventListener('click', minimizeClick);
    	}


			if (this.yearSpan >=5){			
				hasMagnifyListeners = true;	
					
				// Add eventclick listeners (http://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element)
				function magnifyClick(event) { 
		    	var offsetLeft = $(this).offset().left,
		    			offsetTop  = $(this).offset().top,
		    			x = event.pageX - offsetLeft,
		        	y = event.pageY - offsetTop,
		        	clicked = false,
		        	firstYear, 
		        	lastYear;

		      console.log(x+", "+y);

			    // Collision detection between clicked offset and element.
		    	self.magnifiers.forEach(function(element) {
		        if (y > element.position.y && y < element.position.y + element.height 
		          && x > element.position.x && x < element.position.x + element.width) {
	        		
	        		// Set flag to remove eventlistener
	        		clicked = true;
	        		firstYear = element.firstYear;
	        		lastYear  = element.lastYear;

		        	//console.log("Added timeline ("+timelines.length+")");
		        }
			    });
			    
			    // Removing eventlistener (http://stackoverflow.com/questions/4402287/javascript-remove-event-listener)
		      if (clicked) {

		      	// Remove eventlisteners
	        	canvas.removeEventListener('click', magnifyClick);
						if(hasMinimizeListener) canvas.removeEventListener('click', minimizeClick);

	        	// Add a new timeline
	        	timelines.push(new Timeline(firstYear, lastYear));
	        	//console.log("numTimelines "+timelines.length);
	        }
				}

				// Add event listener
				canvas.addEventListener('click', magnifyClick);
			}
		},
		setMagnifiersYear: function(){
			for (var i=0; i<this.magnifiers.length; i++) {
				var lastYear = this.endYear-(this.yearSpan*i),
						firstYear = this.endYear-(this.yearSpan*(i+1));
				this.magnifiers[i].setFirstYear(firstYear);
				this.magnifiers[i].setLastYear(lastYear);
				//console.log('For magnifier '+i+' : Start year: '+firstYear+'\nEnd year: '+lastYear);
			}
			//console.log(this.startYear);
			//this.endYear = this.magnifiers[this.magnifiers.length-1].lastYear;
			//console.log("New endyear: "+ this.endYear);
		},
		draw: function() {
			// Clear timeline
			ct.clearRect(0,0,settings.width,settings.height);  
			ct.rect(0,0,settings.width,settings.height);
			ct.fillStyle = settings.backgroundColor;
			ct.fill();

			this.drawLine();
      // Draw years on timeline
			for (var i=0; i<this.numYears; ++i) {
    		this.drawHolderOnLine(i);
    		this.drawYear(i);
	    }	

	    // Draw magnifiers (if any).
	    if (this.magnifiers.length > 0){    	
		    for (var i=0; i<this.numYears-1; ++i) {
		    	this.magnifiers[i].draw();
				}
	    }

	    // Draw zoom out button if zoomed in.
	    if (this.minimizer.show) {
	    	this.drawZoomout();
	    }
	    this.addDataElements();
		},
		drawZoomout: function() {
			ct.save();
			ct.beginPath();
			ct.translate(this.minimizer.position.x+this.minimizer.width/2, this.minimizer.position.y+this.minimizer.width/2);
      ct.arc(0,0, 10, 0, 2 * Math.PI, false);
      ct.fillStyle = 'white';
      ct.fill();
      ct.lineWidth = 2;
      ct.strokeStyle = 'black';
      ct.stroke();

      ct.beginPath();
      ct.moveTo(-5, 0);
      ct.lineTo(5, 0);
      ct.strokeStyle = '#000',
      ct.lineWidth = 2,
      //ct.lineCap = 'round';
      ct.stroke();

      ct.restore();	
		},
		drawLine: function() {
			var position = new Vector(this.lineAt, this.lineWidth);

      ct.save();
      ct.translate(position.x, position.y);
      ct.beginPath();
      ct.moveTo(0, 0);
      ct.lineTo(0, settings.height-(this.lineWidth*2));
      ct.strokeStyle = '#000',
      ct.lineWidth = this.lineWidth;
      ct.lineCap = 'round';
      ct.stroke();
      ct.restore();	
		},
		drawHolderOnLine: function(i) {
			var width 	= this.holderWidth,
					height 	= this.lineWidth,
					position = new Vector(this.lineAt-width, i*this.rowHeight+this.rowHeight/2)

      ct.save();
      ct.translate(position.x, position.y);
      ct.beginPath();
      ct.moveTo(0, 0);
      ct.lineTo(width, 0);
      ct.strokeStyle = '#000',
      ct.lineCap = 'round';
      ct.lineWidth = this.lineWidth;
      ct.stroke();
      ct.restore();	
		},
		drawYear: function(i) {
			var yearWidth = 50,
					position = new Vector(this.lineAt-this.holderWidth-5, i*this.rowHeight+this.rowHeight/2);

			ct.save();
			ct.translate(position.x,position.y);
      ct.font = this.headlineHeight-4+'px '+settings.font;
      ct.fillStyle = "#222";
      ct.textAlign = 'right';
      ct.textBaseline = "middle";
      ct.fillText(parseInt(this.endYear-(this.yearSpan*i)), 0, 0);
      ct.restore();
			// console.log('Draw year at: '+position.x+", "+position.y);
		},
	}

	// Add function to jquery
  $.fn.yearline = function(options) {   
		return this.each(function() {
			new Plugin(this, options);
		});
  }   

})(jQuery, window, document);

	


