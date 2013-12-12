var lazy  = require("lazy"),
    fs    = require("fs");
    dirty = require('dirty');
    db    = dirty('ritari.db');
    i     = 0;
    S     = require('string');

new lazy(fs.createReadStream('./ritarit.txt'))
     .lines
     .forEach(function(line){
	 lineStr = line.toString();
         console.log(line.toString());
	 if (lineStr.split(',').length === 1) {
	   honor = lineStr;
         } else {
	   var person = {};
	   var values = line.toString().split(',');
	   person.firstName = S(values[0]).trim().s;
	   person.lastName = S(values[1]).trim().s;
	   person.job = S(values[2]).trim().s;
	   person.municipality = S(values[3]).trim().s;
	   person.honor = honor;
	   db.set(i, person);
	   i++;
	 }
     })

db.on('drain', function() {
  console.log("saved to disk");
});
