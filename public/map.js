var map = L.map('demoMap').setView([65.505, 28.00], 6);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

$.get("/muns", function(muns) {
	_.each(muns.muns, function(element, index, list) {
		L.marker([element.latLong.lat, element.latLong.lng]).addTo(map)
  		.bindPopup(element.name, {minWidth: 300});
	});
});

map.on('popupopen', populatePopupContent);

function populatePopupContent(e) {
	var place = e.popup._content;
	$.get("/muns/" + place, function(peopleInMun) {
		_.each(peopleInMun.honors, createPopupContent);
  })
};
  
function createPopupContent(element, index, list) {                                          
  var content = "<br/><strong>" + element.name.split('/')[0] + "(" + element.people.length  + ")</strong>";                                                                                                   
  content = content + "<ul ";                   
  if (element.people.length > 10) {
    content = content + "style='display: none'";
  };                                                                                                  
  content = content + ">";
  _.each(element.people, function(person, i, l) {
    content = content + "<li>" + person.lastName + ", " + person.firstName + ", " + person.job + "</li>";
  });
  content = content + "</ul>";
  $('.leaflet-popup-content').append(content);
};

$(document).on("click", "strong", function(e){
  $(this).next().toggle(); 
});

