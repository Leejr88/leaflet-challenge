function getMarkerOptions(feature) {
    let markerOptions = {
        radius: 0.5,
        fillColor: "black",
        color: "transparent",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.75
    };

    if (feature.properties.mag) {
        // Size the markers according to magnitude but with scaling to make it readable.
        markerOptions['radius'] = feature.properties.mag * 5;
    }

    // Check if this exists before looking.
    if (feature.geometry) {
        // Assign depth as a variable.
        let depth = feature.geometry.coordinates[2];

        // Color point according to depth.
        if (depth <= 0) {
            markerOptions['fillColor'] = "lawngreen";
        } else if (depth <= 1) {
            markerOptions['fillColor'] = "lime";
        } else if (depth <= 3) {
            markerOptions['fillColor'] = "yellowgreen";
        } else if (depth <= 5) {
            markerOptions['fillColor'] = "yellow";
        } else if (depth <= 7) {
            markerOptions['fillColor'] = "orange";
        } else if (depth <= 9) {
            markerOptions['fillColor'] = "darkorange";
        } else {
            markerOptions['fillColor'] = "darkred";
        }
    }

    return markerOptions;
}

// ---------------------------------------------------------------------------------------------------------

// Create the map.
function createMap(data) {
    // Create base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let baseLayers = {
        Street: street,
        Topography: topo
    };

    // Create data layer.
    let earthquake_layer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, getMarkerOptions(feature))
        },
        onEachFeature: function(feature, layer) {
            // Popup assignment for each marker.
            if ((feature.properties.place) && (feature.properties.time) && (feature.properties.url)) {
                let popup = 
                    `<h3>Magnitude: ${feature.properties.mag}</h3>` +
                    `<hr>` + 
                    `<h3>Depth: ${feature.geometry.coordinates[2]}</h3>` +
                    `<hr>` +
                    `<h3>${feature.properties.place}</h3>` +
                    `<hr>` +
                    `<a href="${feature.properties.url}">Visit the site for more information!</a>`        
                layer.bindPopup(popup);
            }

            // Make some custom highlighting.
            layer.on({
                // Highlight the marker being hovered.
                mouseover: function (event) {
                  layer = event.target;
                  layer.setStyle({
                    fillOpacity: 0.9
                  });
                },
                // Unhighlight a marker after being hovered.
                mouseout: function (event) {
                  layer = event.target;
                  layer.setStyle({
                    fillOpacity: 0.75
                  });
                }
              });
        }
    });

    let overlayLayers = {
        Earthquakes: earthquake_layer
    };

    // Initialize the map.
    let myMap = L.map("map", {
        center: [37.0902, -95.7129],
        zoom: 4,
        layers: [street, earthquake_layer]
    });

    // Layer controls.
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    // Legend.
    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let grades = ["0 or Lower", "1 to 10", "11 to 30", "31 to 50", "51 to 70", "71 to 90", "90 or Higher"]; 
        let colors = ["lawngreen", "lime", "yellowgreen", "yellow", "orange", "darkorange", "darkred"];
    
        // Title of the legend.
        div.innerHTML += "<div>Depth of Earthquake (km)</div>";
        
        // Loop thru list and create an element for each bin.
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:'+ colors[i] + '"></i>' + grades[i] + '<br>';
        }
    
        return div;
    };

    legend.addTo(myMap);
}

// Fetches the data and calls createMap.
function updateMap() {
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

    d3.json(url).then(function(data) {
        console.log(data);
        createMap(data);
    });
}

// ---------------------------------------------------------------------------------------------------------
// Run the script.
updateMap();