var map;
var mapDefaultZoom = 10;
var fileName = "ctstore.json";

/**
 * Init HTML5 geolocation or IP location
 */
function getGeolocation() {
    navigator.geolocation.watchPosition(function (position) {
            navigator.geolocation.getCurrentPosition(drawMap);
        },
        function (error) {
            if (error.code == error.PERMISSION_DENIED) {
                document.getElementById("result").innerHTML =
                    "Geolocation is not enabled.";

                getIP(function (data) {
                    drawMap(data);
                });
            }
        });
}

/**
 * 
 * @param {*} callback 
 */

function getIP(callback) {
    fetch('//extreme-ip-lookup.com/json/')
        .then(res => res.json())
        .then((out) => {
            return out;
        })
        .then(out => callback(out))
        .catch(err => console.error(err));
}

/**
 * 
 * @param {*} geoPos 
 */
function drawMap(geoPos) {

    var provider = "HTML";
    if (geoPos.coords) {
        mapLat = geoPos.coords.latitude;
        mapLng = geoPos.coords.longitude;
    } else {
        provider = "IP";
        mapLat = geoPos.lat;
        mapLng = geoPos.lon;
    }

    if (!map) {
        map = new L.Map('map', {
            layers: [
                new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    'attribution': 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                })
            ]
        });
    }


    var latlng = new L.latLng(mapLat, mapLng);
    map.setView(latlng, 12);

    var marker = L.marker([mapLat, mapLng]).addTo(map);
    marker.bindPopup('<b>Lat: ' + mapLat + '<br />Lon:' + mapLng + '</b><br /><br />This is your position using the ' + provider + ' Location.');

    var myIcon = L.icon({
        iconUrl: 'img/icon.png',
        iconSize: [45, 45],
        iconAnchor: [16, 37],
        popupAnchor: [0, -28]
    });

    var stores;

    var markerGroupLayer = L.layerGroup();


    $.getJSON(fileName, function (data) {

        // Define the geojson layer and add it to the map
        stores = L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: myIcon
                });
                markerGroupLayer.addLayer(marker);
                return marker;
            }
        }).addTo(map);
        var currentPos = [mapLat, mapLng];
        closestStore(currentPos, stores, 1);
    });
}

/**
 * 
 * @param {*} currentPos 
 * @param {*} stores 
 * @param {*} numResults 
 */
function closestStore(currentPos, stores, numResults) {

    var distances = [];

    stores.eachLayer(function (l) {
        var distance = L.latLng(currentPos).distanceTo(l.getLatLng()) / 1000;
        distances.push(distance);
    });

    distances.sort(function (a, b) {
        return a - b;
    });

    stores.eachLayer(function (l) {

        var distance = L.latLng(currentPos).distanceTo(l.getLatLng()) / 1000;

        if (distance < distances[numResults]) {
            document.getElementById("result").innerHTML = "Closest Canadian Tire Store is : <b>" + l.feature.properties.store_name + "</b>";
        }
    });

}