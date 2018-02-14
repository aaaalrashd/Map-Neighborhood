var locations = [{
        name: "Dec 31 Restaurant",
        id: "590c944082a750569d0d0fad",
        lat: 24.77545066691707,
        lng: 46.70865136465581

    },
    {
        name: "KIVAHAN Coffee",
        id: "57ebe8bfcd108269309193e4",
        lat: 24.777679601772192,
        lng: 46.70764392937774

    },
    {
        name: "Black Garden",
        id: "56574d44498ebb766025d2ad",
        lat: 24.780865575427484,
        lng: 46.697109757885286

    },
    {
        name: "Misk - Udacity Connect Program",
        id: "5969fbddb3c9615cca1cce2c",
        lat: 24.775451,
        lng: 46.708297
    },
    {
        name: "Al Taawun District Walk",
        id: "4ec13d2e93ad36d7a9b0e198",
        lat: 24.774301437122933,
        lng: 46.702587146226726
    },
    {
        name: "Camel Step Coffee Roasters",
        id: "53adccbd498ec970f3c9e074",
        lat: 24.769316602442746,
        lng: 46.69099493515608

    }
];

// Initialize the map //
var map;

function initMap() {
    'use strict';
    map = new google.maps.Map(document.getElementById('map'), {
        // My Home //
        center: {
            lat: 24.777853,
            lng: 46.696326
        },
        zoom: 15,
    });

    // ViewModel with google //
    ko.applyBindings(new ViewModel());
}

function googleError() {
    'use strict';
    document.getElementById('error').innerHTML = "<h2>Oops, Please try again.</h2>";
}

var Place = function(data) {
    'use strict';
    this.name = ko.observable(data.name);
    this.id = ko.observable(data.id);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    //this.marker = ko.observable();//
    this.rating = ko.observable('');
    this.canonicalUrl = ko.observable('');
};

// ViewModel Start //
var ViewModel = function() {
    'use strict';
    // Make this accessible
    var self = this;

    this.placeList = ko.observableArray([]);

    locations.forEach(function(placeItem) {
        self.placeList.push(new Place(placeItem));
    });


    var infowindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    var marker;

    self.placeList().forEach(function(placeItem) {
        // Identify markers for each place
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        placeItem.marker = marker;

        // AJAX call to Foursquare //
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
                '?client_id=BG3GFG3DGP5WHG2QLAO2EXC5S02EXWMDZXH1KOSUIQKGHCF2&client_secret=BR1NZ0OKG0XQGIIHT5BJXSBMMDPRQGN4YEXTHSNL4DUVRFZR&v=20180208',
            dataType: "json",
            success: function(data) {
                var result = data.response.venue;
                
                var rating = result.hasOwnProperty('rating') ? result.rating : '';
                placeItem.rating(rating || 'none');

                placeItem.canonicalUrl(result.canonicalUrl);

                var contentString = '<div id="iWindow"><h4>' + placeItem.name() +
                    '<p>By Foursquare:</p>' + '</p><p>Rating: ' + placeItem.rating() +
                    '</a></p><p><a target="_blank" href=' + placeItem.canonicalUrl() +
                    '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/24.777853,46.696326/' +
                    placeItem.lat() + ',' + placeItem.lng() + '>Get Directions</a></p></div>';


                google.maps.event.addListener(placeItem.marker, 'click', function() {
                    infowindow.open(map, this);
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        placeItem.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(contentString);
                    map.setCenter(placeItem.marker.getPosition());
                });
            },
            error: function() {
            document.getElementById("error").innerHTML = "<h3>some data is unavailable. Please try again.</h3>";
        }
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, this);
            placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            infowindow.setContent("<h3>Oops, data is unavailable. Please visit by use foursquare :(</h3>");
        });
    });

    // trigger marker //
    self.showInfo = function(placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
        self.hideElements();
    };

    // Toggle the nav class based style //
    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed(function() {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
    }, this);

    self.hideElements = function(toggleNav) {
        self.toggleNav(true);
        return true;
    };

    self.showElements = function(toggleNav) {
        self.toggleNav(false);
        return true;
    };


    self.visible = ko.observableArray();
    // All markers showing //
    self.placeList().forEach(function(place) {
        self.visible.push(place);
    });

    //  Filter by user //
    self.userInput = ko.observable('');
    self.filterMarkers = function() {
        var searchInput = self.userInput().toLowerCase(); // Search in small letter and capital //
        self.visible.removeAll();
        self.placeList().forEach(function(place) {
            place.marker.setVisible(false);
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function(place) {
            place.marker.setVisible(true);
        });
    };

}; // Model END