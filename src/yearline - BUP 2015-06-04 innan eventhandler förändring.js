$(document).ready(function() {
    'use strict';   

    // ### Put this in other document
    $('.yearline1').yearline({
    	color:'#fff', 
    	backgroundColor:'#cc3333',
    	width: 100,
    	height: 100,
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
			settings;
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

	


	function Plugin(div, options) {
	  // Variables
	  settings = $.extend({
      // These are the defaults.
      color: "#556b2f",
      backgroundColor: "white",
      width: 300,
      height: 500,
      borderRadius: 10
    }, options ),
	  this.div = div;
	  

		// Set minimim height and width.
	  if (settings.height < 300) settings.height =300;
	  if (settings.width < 400)  settings.width =400;
	  
	  this.init();
	}

	Plugin.prototype = {

		init: function() {
			var datastore,
				source = $(this.div),
				timeline;

			datastore = this.extractData(source);
			source.text(""); // Clean div
			this.createWorkspace(source);
			this.from = datastore[0].year;
			this.to 	= datastore[datastore.length-1].year;
			timelines.push = new Timeline(this.from, this.to);
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
          'height': settings.height +10,
          'position' : 'relative',
      }).appendTo(source);

   		// Add canvas
      $( "<canvas id='timelineCanvas' width='" + settings.width + "' height='" + settings.height + "'></canvas>" ).appendTo($( "#timelineWrapper" ));
      canvas = document.getElementById('timelineCanvas');					//elem
      ct 				= canvas.getContext('2d');												//context
      /*
      canvas.addEventListener('click', function() { }, false);		//### can i remove this? ###
      elemLeft	= canvas.offsetLeft;
    	elemTop 	= canvas.offsetTop;
      
      elements = [];

      // Add event listerner for 'click' events.
      canvas.addEventListener('click', function(event) { 
		    var x = event.pageX - elemLeft,
		        y = event.pageY - elemTop;

		  	// Collision detection between clicked offset and element.
		    elements.forEach(function(element) {
		        if (y > element.top && y < element.top + element.height 
		            && x > element.left && x < element.left + element.width) {
		            alert('clicked an element');
		        }
		    });

      }, false);

      // Add element.
			elements.push({
			    colour: '#05EFFF',
			    width: 150,
			    height: 100,
			    top: 20,
			    left: 15
			});

			// Render elements.
			elements.forEach(function(element) {
			    ct.fillStyle = element.colour;
			    ct.fillRect(element.left, element.top, element.width, element.height);
			});
			*/


		},
	}

  /**
	 * easytimeline data
	 */
	function Data(year, title, text, category) {
	  this.year   	= year 			|| 1900;
	  this.title		= title 		|| 'No title';
	  this.text 		= text 			|| 'No text';
	  this.category = category 	|| null;
	}
	   
	Data.prototype = {

	  createHtml: function() {
	    var x = 10, 
	        y = 12;

	  },
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
	function Magnifier(x, y,i) {
		this.radius = 6;
		this.lineWidth = 2;
		this.width = this.radius*2+this.lineWidth;
		this.height = this.radius*2+this.lineWidth;
		this.colour = "#000";
		this.backgroundColor = "white";
		this.position = new Vector(x,y);
		this.firstYear;
		this.lastYear;
		// console.log('Magnifier added at: '+this.position.x+", "+this.position.y);
	}

	Magnifier.prototype = {
		draw: function() {
			ct.save();
			ct.beginPath();
			ct.translate(this.position.x, this.position.y)
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

	function Timeline(from, to) {
	  this.numYears,	// number of years to show to left of timeline
		this.yearSpan,	// span between numYears
		this.zoom 			= new Array(); // Array for holding start and end years when zooming in and out.
		this.startYear  = from,
		this.endYear		= to,
		this.rowHeight  = 50,
		this.lineAt			= 100,
		this.lineWidth	= 3,
		this.holderWidth= 5,
		this.magnifiers = new Array(),
		this.init();

	}

	Timeline.prototype = {
		init: function() {
			console.log('Added timeline: ' + this.startYear +"-"+this.endYear);
			this.numYears = Math.ceil(settings.height / this.rowHeight);
			this.yearSpan = Math.ceil((this.endYear- this.startYear) / this.numYears);
			//this.zoom.push(new Zoom(datastore[0].year, datastore[datastore.length-1].year, this.numYears));
			this.addMagnifiers();
			this.draw();
		},

		addMagnifiers: function(){
			if (this.yearSpan >=5){				
				// Add megnifiers
		    for (var i=0; i<this.numYears-1; ++i) {
		    	this.magnifiers.push(new Magnifier(this.lineAt,i*this.rowHeight+this.rowHeight));
				}
				this.setMagnifiersYear();
					
				// Add eventclick listeners
				var clicked = false;
				var self = this; // Capturing "this" into a local variable
				canvas.addEventListener('click', function(event) { 
		    	var x = event.pageX - canvas.offsetLeft,
		        	y = event.pageY - canvas.offsetTop,
		        	clicked = false;

			    // Collision detection between clicked offset and element.
		    	self.magnifiers.forEach(function(element) {
		        if (y > element.position.y && y < element.position.y + element.height 
		          && x > element.position.x && x < element.position.x + element.width) {
	        		//console.log("Clicked at: "+x+", "+y+"\nYears: "+element.firstYear+", "+element.lastYear);
		        	
		        	// Add a new timeline
		        	timelines.push = new Timeline(element.firstYear, element.lastYear);
		        }
		        /*
		        if (clicked) {
		        	console.log('Need to remove addEventListener');
		        	// Removing eventlistener
		        	canvas.removeEventListener('click', this);
							clicked = false;
		        }
		        */
			    });

				}, false);
			}
		},
		setMagnifiersYear: function(){
			for (var i=0; i<this.magnifiers.length; i++) {
				var lastYear = this.endYear-(this.yearSpan*i),
						firstYear = this.endYear-(this.yearSpan*(i+1));
				this.magnifiers[i].setFirstYear(firstYear);
				this.magnifiers[i].setLastYear(lastYear);
				// console.log('For magnifier '+i+' : Start year: '+firstYear+'\nEnd year: '+lastYear);
			}
		},


		draw: function() {
			ct.clearRect(0,0,settings.width,settings.height);
			//console.log("rows :" + this.numYears + ", yearspan: " + this.yearSpan);

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
	    if (timelines.length > 1) {
	    	//### NEED FIXING
	    	alert("!!!!!!!!!!!!Draw zoomout!!!!!!!!!!!!!!!");
	    }

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
      ct.font = "12px Arial";
      ct.fillStyle = "#222";
      ct.textAlign = 'right';
      ct.textBaseline = "middle";
      ct.fillText(this.endYear-(this.yearSpan*i), 0, 0);
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

	


