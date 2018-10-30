var markers = [];
var bounds;
var Infowindow;


var locations = [
          {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
          {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
          {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
          {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
          {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
          {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
        ];
 var Location=function(data){
 	var self = this;
    this.title = data.title;
    this.location = data.location;
    this.active = ko.observable(true);
	this.marker = new google.maps.Marker({
		position: data.location,
		map: map,
		title: data.title,
		icon: self.defaultIcon,
		animation: google.maps.Animation.DROP,
	});
	markers.push(this.marker);
	this.display = ko.computed( function() {
		if(self.active() === true) {
			self.marker.setMap(map);
			bounds.extend(self.marker.position);
			map.fitBounds(bounds)
		} else {
			self.marker.setMap(null);
		}
	});	
	// Declares the variable and gives inherited functionality
	this.marker.addListener('click', function() {
		self.marker.setAnimation(google.maps.Animation.BOUNCE)
		setTimeout(function() {
			self.marker.setAnimation(null);
		}, 1400);
	});
    this.marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
          });
	
};
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }






//========================= V I E W  M O D E L =========================//

function initMap() {
// Defines map variable as the new google map with parameters.
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 40.7413549, lng: -73.9980244},
	  zoom: 13,
	  
	});

	infowindow = new google.maps.InfoWindow();

	// Declares the variable and gives inherited functionality
	bounds = new google.maps.LatLngBounds();
	ko.applyBindings(new ViewModel());
};

function mapError() {
	document.getElementById("map").innerHTML = "<h2>An error occured while loading your map. Please refresh the page to try again.</h2>";
};

var ViewModel = function() {
	var self = this;

	//Create an observabelt array to fill with Locations
	this.placeList = ko.observableArray([]);

	//loop over each place and push them into the placeList array
	locations.forEach(function(locItem) {
		self.placeList.push( new Location(locItem) );
	});
	this.currentMarker = ko.observable( this.placeList()[0] );

	this.listClick = function(place) {
	      google.maps.event.trigger(place.marker, 'click');
	};

	this.showPlaces = function() {
		self.placeList().forEach(function(place) {
			place.active(true);
		})
	};
	this.hidePlaces = function() {
		self.placeList().forEach(function(place) {
			place.active(false);
		})
	};

	// Query search results in the sidebar using the ko utils array Filter
	//function.
	this.query = ko.observable('');
	this.filteredPlaces = ko.computed(function() {
		self.hidePlaces();
		var search = self.query().toLowerCase();
		var these = ko.utils.arrayFilter(self.placeList(), function(place) {
			return place.title.toLowerCase().indexOf(search) >= 0;
		});
		if (these) {
			for (var i = 0; i < these.length; i++) {
				these[i].active(true);
			}
		return these;
		}
	});


};