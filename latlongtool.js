var dirty 	 = require('dirty'),
    S     	 = require('string'),
    request  = require('request-json'),
    db    	 = dirty('ritari.db1'),
    client 	 = request.newClient('http://maps.googleapis.com/maps/api/geocode/'),
    LineByLineReader = require('line-by-line'),
 	lr 		 = new LineByLineReader('./ritarit2.txt', {skipEmptyLines: true}),
    i     	 = 0,
    munCache = {},
    honor    = "";

lr.on('line', function(line) {
	var lineStr = line.toString();
  if (lineStr.split(',').length === 1) {
  	honor = lineStr;
  } else {
	  var person = {};
	  var values = lineStr.split(',');
	  person.firstName = S(values[1]).trim().s;
	  person.lastName = S(values[0]).trim().s;
	  person.job = S(values[2]).trim().s;

   	  municipality = S(values[3]).trim().s;
	  person.honor = honor;
	  	
	  client.get('json?sensor=true&address='+municipality, function(err, res, body) {
		var latLong = body.results[0].geometry.location;
		var munValue = {};
		munValue.name = body.results[0].address_components[0].long_name;
		munValue.latLong = latLong;
		person.municipality = munValue;
		munCache[munValue.name] = munValue;
		
	    i++;
        db.set(i, person);
	  });
	  console.log(munCache);

  }
  lr.resume();
})

db.on('drain', function() {
  console.log("saved to disk");
});
