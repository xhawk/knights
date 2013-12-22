var dirty 	 	= require('dirty'),
    S     	 	= require('string'),
    request  	= require('request-json'),
    db    	 	= dirty('ritari.db1'),
    client 	 	= request.newClient('http://maps.googleapis.com/maps/api/geocode/'),
    LineByLineReader = require('line-by-line'),
 		lr 		 		= new LineByLineReader('./ritarit2.txt', {skipEmptyLines: true}),
    i     	 	= 0,
    munCache 	= {
      "Tampere": { municipality:{name:"Tampere",latLong:{lat:61.4981508,lng:23.7610254}}},
      "Vantaa": {municipality:{name:"Vantaa",latLong:{lat:60.2933664,lng:25.0377329}}},
      "Jyv¤skyl¤": {municipality:{name:"Jyväskylä",latLong:{lat:62.244747,lng:25.7472184}}},
      "Helsinki": {municipality:{name:"Helsinki",latLong:{lat:60.17332440000001,lng:24.9410248}}},
      "Yl¤ne": {municipality:{name:"Yläne",latLong:{lat:60.8796698,lng:22.4093605}}},
      "Turku": {municipality:{name:"Turku",latLong:{lat:60.4493248,lng:22.259231}}},
      "Espoo": {municipality:{name:"Espoo",latLong:{lat:60.2054911,lng:24.6559001}}},
      "Kuopio": {municipality:{name:"Kuopio",latLong:{lat:62.8933347,lng:27.6793385}}},
      "Vaasa": {municipality:{name:"Vaasa",latLong:{lat:63.0951412,lng:21.6165128}}},
      "Oulu": {municipality:{name:"Oulu",latLong:{lat:65.0126148,lng:25.4714526}}}
    },
    honor    	= "";

lr.on('line', persistLine);

function persistLine(line) {
	lr.pause();
	var lineStr = line.toString();
  var ms = 0;
  if (lineStr.split(',').length === 1) {
  	honor = lineStr;
  } else {
	  var person = {};
	  var values = lineStr.split(',');
	  person.firstName = S(values[1]).trim().s;
	  person.lastName = S(values[0]).trim().s;
	  person.job = S(values[2]).trim().s;

   	municipality = S(values[3]).trim().s;
	  person.honor = honor;
	
    console.log(munCache[municipality]); 
    if (munCache[municipality] === undefined) { 
	    client.get('json?sensor=true&address='+municipality, function(err, res, body) {
	  	  console.log("Fetcing!");	
		  	var latLong = body.results[0].geometry.location;
			  var munValue = {};
			  munValue.name = body.results[0].address_components[0].long_name;
			  munValue.latLong = latLong;
			  person.municipality = munValue;
		    db.set(i, person);
        i++;
        ms = 180000;  
	    });
    } else {
      console.log("Cache hit");
      person.municipality = munCache[municipality].municipality;
      db.set(i, person); 
      i++;
      ms = 1000;
    }
  }
  time(ms);
}

function time(ms) {
  setTimeout(function(){
    console.log("sleep")
 		lr.resume()
  }, ms);
}

db.on('drain', function() {
  console.log("saved to disk");
});
