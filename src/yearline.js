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
	  this.settings = $.extend({
	        // These are the defaults.
	        color: "#556b2f",
	        backgroundColor: "white",
	        width: 300,
	        height: 500,
	        borderRadius: 10
	      }, options ),
	  this.div = div;

		// Set minimim height and width.
	  if (this.settings.height < 300) this.settings.height =300;
	  if (this.settings.width < 400) this.settings.width =400;
	  
	  this.init();
	}

	Plugin.prototype = {

		init: function() {
			var datastore,
					source = $(this.div),
					timeline;

			datastore = this.extractData(source);
			timeline = new Timeline(datastore, this.settings);
			// Set yearSpan
			source.text(""); // Clean div
			this.createWorkspace(source);
			timeline.draw();
			console.log(datastore[0].title);
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
	      	console.log("found start at "+i);
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
          'width': this.settings.width,
          'height': this.settings.height +10,
          'position' : 'relative',
      }).appendTo(source);

   		// Add canvas
      $( "<canvas id='timelineCanvas' width='" + this.settings.width + "' height='" + this.settings.height + "'></canvas>" ).appendTo($( "#timelineWrapper" ));
      canvas = document.getElementById('timelineCanvas');
      ct = canvas.getContext('2d');
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

	// Takes in CENTER POSITION of magnifier.
	function Magnifier(x, y) {
		this.radius = 6;
		this.position = new Vector(x,y);
		console.log('Magnifier added at: '+this.position.x+", "+this.position.y); 
	}

	Magnifier.prototype = {
		draw: function() {
			ct.save();
			ct.beginPath();
			ct.translate(this.position.x, this.position.y)
      ct.arc(0,0, this.radius, 0, 2 * Math.PI, false);
      ct.fillStyle = 'white';
      ct.fill();
      ct.lineWidth = 2;
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

		}

	}

	function Timeline(datastore, settings) {
	  this.numYears,	// number of years to show to left of timeline
		this.yearSpan,	// span between numYears
		this.startYear,	// earliest year of timeline
		this.endYear,		// latest year of timeline
		this.rowHeight  = 50,
		this.lineAt			= 100,
		this.lineWidth	= 3,
		this.holderWidth= 5,
		this.settings		= settings,
		this.magnifiers = new Array();
		this.datastore	= datastore;
		this.init(datastore, settings);

	}

	Timeline.prototype = {
		init: function(datastore, settings) {
			this.endYear 	= datastore[datastore.length-1].year;
			console.log('Endyear: ' + this.endYear);
			this.startYear= datastore[0].year;
			this.numYears = Math.ceil(settings.height / this.rowHeight);
			this.yearSpan = Math.ceil((this.endYear- this.startYear) / this.numYears);
     	
     	// Create magnifiers
	    for (var i=0; i<this.numYears-1; ++i) {
	    	this.magnifiers.push(new Magnifier(this.lineAt,i*this.rowHeight+this.rowHeight));
			}
		},

		draw: function() {
	
			console.log("rows :" + this.numYears + ", yearspan: " + this.yearSpan);

			this.drawLine();
      // Draw years on timeline
			for (var i=0; i<this.numYears; ++i) {
    		this.drawHolderOnLine(i);
    		this.drawYear(i);
	    }	

	    // Draw magnifiers
	    for (var i=0; i<this.numYears-1; ++i) {
	    	this.magnifiers.push(new Magnifier(this.lineAt,i*this.rowHeight+this.rowHeight));
	    	this.magnifiers[i].draw();
			}
		},

		drawLine: function() {
			var position = new Vector(this.lineAt, this.lineWidth);

      ct.save();
      ct.translate(position.x, position.y);
      ct.beginPath();
      ct.moveTo(0, 0);
      ct.lineTo(0, this.settings.height-(this.lineWidth*2));
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
			console.log('Draw year at: '+position.x+", "+position.y);
		},

	}

	// Add function to jquery
  $.fn.yearline = function(options) {   
		return this.each(function() {
			new Plugin(this, options);
		});
  }   




})(jQuery, window, document);

	


