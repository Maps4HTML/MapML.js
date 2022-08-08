
// Takes GeoJSON Properties to return an HTML table, helper function
//    for geojson2mapml
// properties2Table: Str -> HTML Table
function properties2Table(json) {
    let table = document.createElement('table');

    // Creating a Table Header
    let thead = table.createTHead();
    let row = thead.insertRow();
    let th1 = document.createElement("th");
    let th2 = document.createElement("th");
    th1.appendChild(document.createTextNode("Property name"));
    th2.appendChild(document.createTextNode("Property value"));
    th1.setAttribute("role", "columnheader");
    th2.setAttribute("role", "columnheader");
    th1.setAttribute("scope", "col");
    th2.setAttribute("scope", "col");
    row.appendChild(th1);
    row.appendChild(th2);

    // Creating table body and populating it from the JSON
    let tbody = table.createTBody();
    for (let key in json) {
        if (json.hasOwnProperty(key)) {

            let row = tbody.insertRow();
            let th = document.createElement("th");
            let td = document.createElement("td");
            th.appendChild(document.createTextNode(key));
            td.appendChild(document.createTextNode(json[key]));
            th.setAttribute("scope", "row");
            td.setAttribute("itemprop", key);
            row.appendChild(th);
            row.appendChild(td);
        }
    }
    return table;
}



// Takes GeoJSON Objects and returns a <layer-> Element
// geojson2mapml: GeoJSON-OBJ <layer-> -> <layer->
function geojson2mapml(json, MapML = null) {
    let geometryType = ["POINT", "LINESTRING", "POLYGON", "MULTIPOINT", "MULTILINESTRING", "MULTIPOLYGON", "GEOMETRYCOLLECTION"];
    let jsonType = json.type.toUpperCase();
    let layer = MapML;
    let out = "";

    // HTML parser
    let parser = new DOMParser();

    // initializing layer
    if (layer == null) {
        // creating an empty mapml layer
        let xmlStringLayer = "<layer- label='' checked=''><map-meta name='projection' content='OSMTILE'></map-meta><map-meta name='cs' content='gcrs'></map-meta></layer->";
        layer = parser.parseFromString(xmlStringLayer, "text/html");
        //console.log(layer)
        if (json.name) {
            layer.querySelector("layer-").setAttribute("label", json.name);
        } else{
            layer.querySelector("layer-").setAttribute("label", "Layer");
        }
    }
    let point = "<map-point></map-point>";
    point = parser.parseFromString(point, "text/html");

    let multiPoint = "<map-multipoint><map-coordinates></map-coordinates></map-multipoint>";
    multiPoint = parser.parseFromString(multiPoint, "text/html");

    let linestring = "<map-linestring><map-coordinates></map-coordinates></map-linestring>";
    linestring = parser.parseFromString(linestring, "text/html");

    let multilinestring = "<map-multilinestring></map-multilinestring>";
    multilinestring = parser.parseFromString(multilinestring, "text/html");

    let polygon = "<map-polygon></map-polygon>";
    polygon = parser.parseFromString(polygon, "text/html");

    let multiPolygon = "<map-multipolygon></map-multipolygon>";
    multiPolygon = parser.parseFromString(multiPolygon, "text/html");

    let geometrycollection = "<map-geometrycollection></map-geometrycollection>";
    geometrycollection = parser.parseFromString(geometrycollection, "text/html");

    let feature = "<map-feature class='child' zoom='2'><map-featurecaption></map-featurecaption><map-geometry></map-geometry><map-properties></map-properties></map-feature>";
    feature = parser.parseFromString(feature, "text/html");

    // Template to add coordinates to Geometries
    let coords = "<map-coordinates></map-coordinates>";
    coords = parser.parseFromString(coords, "text/html");
    
    //console.log(layer);
    if (jsonType === "FEATURECOLLECTION") {
        let features = json.features;
        //console.log("Features length - " + features.length);
        for (l=0;l<features.length;l++) {
            geojson2mapml(features[l], layer);
        }
    } else if (jsonType === "FEATURE") {

        let clone_feature = feature.cloneNode(true);
        let curr_feature = clone_feature.querySelector('map-feature');

        // Setting Properties
        let p = properties2Table(json.properties);
        //console.log(p);
        curr_feature.querySelector('map-properties').appendChild(p);

        // Setting map-geometry
        let g = geojson2mapml(json.geometry, 1);
        //console.log(g);
        curr_feature.querySelector('map-geometry').appendChild(g);
        
        // Appending feature to layer
        layer.querySelector('layer-').appendChild(curr_feature);
        
    } else if (geometryType.includes(jsonType)) {
        //console.log("Geometry Type - " + jsonType);
        switch(jsonType){
            case "POINT": // ---------------------------------------------------------------------------
                out = json.coordinates[0] + " " + json.coordinates[1];
                
                // Create Point element
                let clone_point = point.cloneNode(true);
                clone_point = clone_point.querySelector('map-point');

                // Create map-coords to add to the polygon
                let clone_coords = coords.cloneNode(true);
                clone_coords = clone_coords.querySelector("map-coordinates");

                clone_coords.innerHTML = out;

                clone_point.appendChild(clone_coords);
                //console.log(clone_point);
                return clone_point;

            case "LINESTRING": // ---------------------------------------------------------------------------
                let clone_linestring = linestring.cloneNode(true);
                let linestring_coordindates = clone_linestring.querySelector("map-coordinates");
                
                out = "";

                for (x=0;x<json.coordinates.length;x++) {
                    out = out + json.coordinates[x][0] + " " + json.coordinates[x][1] + " ";
                }

                linestring_coordindates.innerHTML = out;
                //console.log(clone_linestring.querySelector('map-linestring'));
                return (clone_linestring.querySelector('map-linestring'));

            case "POLYGON": // ---------------------------------------------------------------------------
                let clone_polygon = polygon.cloneNode(true);
                clone_polygon = clone_polygon.querySelector("map-polygon");
                
                // Going over each coordinates
                for (y=0;y<json.coordinates.length;y++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");

                    // Going over coordinates for the polygon
                    for (x=0;x<json.coordinates[y].length;x++) {
                        out = out + json.coordinates[y][x][0] + " " + json.coordinates[y][x][1] + " ";
                    }

                    // Create map-coordinates element and append it to clone_polygon
                    clone_coords.innerHTML = out;

                    clone_polygon.appendChild(clone_coords);
                }
                //console.log(clone_polygon);
                return clone_polygon;

            case "MULTIPOINT": // ---------------------------------------------------------------------------
                out = "";
                // Create multipoint element
                let clone_multipoint = multiPoint.cloneNode(true);
                clone_multipoint = clone_multipoint.querySelector('map-multipoint');

                for (i=0;i<json.coordinates.length;i++) {
                    out = out + json.coordinates[i][0] + " " + json.coordinates[i][1] + " ";
                }
                clone_multipoint.querySelector('map-coordinates').innerHTML = out;
                return clone_multipoint;

            case "MULTILINESTRING": // ---------------------------------------------------------------------------
                let clone_multilinestring = multilinestring.cloneNode(true);
                clone_multilinestring = clone_multilinestring.querySelector("map-multilinestring");

                for(i=0;i<json.coordinates.length;i++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");
                    for(y=0;y<json.coordinates[i].length;y++) {
                        out = out + json.coordinates[i][y][0] + " " + json.coordinates[i][y][1] + " ";
                    }
                    clone_coords.innerHTML = out
                    clone_multilinestring.appendChild(clone_coords);
                }
                return clone_multilinestring;

            case "MULTIPOLYGON": // ---------------------------------------------------------------------------
                let m = multiPolygon.cloneNode(true);
                m = m.querySelector('map-multiPolygon');

                // Going over each Polygon
                for (i=0;i<json.coordinates.length;i++) {
                    let clone_polygon = polygon.cloneNode(true);
                    clone_polygon = clone_polygon.querySelector("map-polygon");
                    
                    // Going over each coordinates
                    for (y=0;y<json.coordinates[i].length;y++) {
                        let out = "";
                        let clone_coords = coords.cloneNode(true);
                        clone_coords = clone_coords.querySelector("map-coordinates");

                        // Going over coordinates for the polygon
                        for (x=0;x<json.coordinates[i][y].length;x++) {
                            out = out + json.coordinates[i][y][x][0] + " " + json.coordinates[i][y][x][1] + " ";
                        }

                        // Create map-coordinates element and append it to clone_polygon
                        clone_coords.innerHTML = out;

                        clone_polygon.appendChild(clone_coords);
                    }
                    m.appendChild(clone_polygon);
                }
                return m;
            case "GEOMETRYCOLLECTION": // ---------------------------------------------------------------------------
                let g = geometrycollection.cloneNode(true);
                g = g.querySelector('map-geometrycollection');
                //console.log(json.geometries);
                for (i=0;i<json.geometries.length;i++) {
                    let fg = geojson2mapml(json.geometries[i], 1);
                    g.appendChild(fg);
                }
                return g;
        }
    }
    return layer;
}



function mapml2geojson(element) {
    let json = {};
    json.type = "FeatureCollection";
    json.features = [];

    // Iterating over each feature
    let features = element.querySelectorAll("map-feature");
    let num = 0;
    features.forEach((feature) => {
        console.log(feature);

        json.features[num] = {"type": "Feature"};
        json.features[num].geometry = {};
        json.features[num].properties = {};

        let geom = feature.querySelector("map-geometry");
        console.log(geom.children[0].nodeName);
        switch(geom.children[0].nodeName) {
            case "MAP-POINT":
                json.features[num].geometry.type = "Point";
                json.features[num].geometry.coordinates = geom.querySelector('map-coordinates').innerHTML.split(" ");
                return;
            case "MAP-LINESTRING":
                json.features[num].geometry.type = "LineString";
                let coords = geom.querySelector('map-coordinates').innerHTML.split(" ");
                console.log(coords);
                // TO DO
                return;
            case "MAP-POLYGON":
                // TO DO
            case "MAP-MULTIPOINT":
                // TO DO
            case "MAP-MULTILINESTRING":
                // TO DO
            case "MAP-MULTIPOLYGON":
                // TO DO
            case "MAP-GEOMETRYCOLLECTION":
                // TO DO
        }
        // going to next feature
        num++;
    });

    console.log(json);
    return json;
}

// Testing in json_test.html