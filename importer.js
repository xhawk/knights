var lazy  	 = require("lazy"),
    fs    	 = require("fs"),
    dirty 	 = require('dirty'),
    S     	 = require('string'),
    http     = require('http'),
    request  = require('request-json'),
    sync     = require('sync'),
    db    	 = dirty('ritari.db'),
    client 	 = request.newClient('http://maps.googleapis.com/maps/api/geocode/'),
    i     	 = 0,
    functionId = 1,
    eventEmitter = require('events').EventEmitter,       //Event Emitter from core
		ee = new eventEmitter,
    munCache = {};



function asd(municipality, funcId, callback) {
	client.get('json?sensor=true&address='+municipality, function(err, res, body) {
		var latLong = body.results[0].geometry.location;
		var munValue = {};
		munValue.name = municipality;
		munValue.latLong = latLong;
		console.log("Ready " + funcId);
		callback(null, munValue);
	})
}

new lazy(fs.createReadStream('./ritarit.txt'))
  .lines
  .forEach(function(line){
  	console.log("Start function " + functionId);
  	sync(function() {
		  lineStr = line.toString();
	    //console.log(line.toString());
			if (lineStr.split(',').length === 1) {
			  honor = lineStr;
		  } else {
	  		functionId++;
			  var person = {};
			  var values = line.toString().split(',');
			  person.firstName = S(values[1]).trim().s;
			  person.lastName = S(values[0]).trim().s;
			  person.job = S(values[2]).trim().s;

		   	municipality = S(values[3]).trim().s;
	 	  	
 	  		if (municipality in munCache) {
 	  			console.log("cache hit");
		 	 	  person.municipality = munCache[municipality];
		 	  } else {
	 	  		var munis = asd.sync(null, municipality, functionId);
	 	  		//console.log(munis);
	 	  		munCache[munis.name] = munis;
	 	  		person.municipality = munis;
				}

				//console.log(munCache);

		    person.honor = honor;
		    db.set(i, person);
		    i++;
	 	  	
		  }
	  }) // end sync
	  console.log("end function " + functionId);
	}
)

db.on('drain', function() {
  console.log("saved to disk");
});
