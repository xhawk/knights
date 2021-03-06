var dirty = require('dirty');
    db    = dirty('ritari.db1');
    express = require('express');
    app   = express();
    _     = require('underscore');
    path  = require('path');
var mun   = {};
    mun.muns = [];

db.on('load', function(){
  console.log('database loaded');
  app.listen(9000);
  console.log('App ready!');
});

getMunicipalities = function() {
  return function(req, res) {
    db.forEach(function(key, val) {
      if (typeof val.municipality !== 'undefined') {
        mun.muns.push(val.municipality);
        mun.muns = _.uniq(mun.muns, function(item,key,a){
          return item.name;
        })
      }
    });
    res.send(mun);
  }
}

getPeople = function() {
  return function(req, res) {
    var peopleInMun = {};
    var mun = req.param('mun');
    peopleInMun.municipality = req.param('mun');
    peopleInMun.honors = [];

    db.forEach(function(key, val){
      if (typeof val.municipality !== 'undefined' && val.municipality.name === mun) {
        peopleInMun.honors.push({name: val.honor, people: []});
        peopleInMun.honors = _.uniq(peopleInMun.honors, function(item, key, a){
          return item.name;
        });
        
        _.each(peopleInMun.honors, function(element, index, list) {
          if (val.honor === element.name) {
            element.people.push({'firstName': val.firstName, 'lastName': val.lastName, 'job': val.job});
          }
        });
      }
    });
    _.each(peopleInMun.honors, function(element, index, list) {
      // sort by name
      element.people.sort(function(a, b) {
        if(a.lastName < b.lastName) return -1;
        if(a.lastName > b.lastName) return 1;
        return 0;
      });
    });
    res.send(peopleInMun);
  }
}

// serve static pages
app.use(express.static(path.join(__dirname, 'public')));
app.use("/lib", express.static(path.join(__dirname, 'bower_components')));

// Routes
app.get('/muns', getMunicipalities());
app.get('/muns/:mun', getPeople());

