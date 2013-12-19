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
		_.each(peopleInMun.honors, function(element, index, list) {
			var content = "<br/><strong>" + element.name.split('/')[0] + "</strong>";
			_.each(element.people, function(person, i, l) {
				content = content + "<br/>" + person;
			});
			$('.leaflet-popup-content').append(content);
		});
	});
}
