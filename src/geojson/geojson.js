// Takes GeoJSON Properties to return an HTML table, helper function
//    for geojson2mapml
// properties2Table: geojson -> HTML Table
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

// Takes a GeoJSON geojson and an options Object which returns a <layer-> Element
// The options object can contain the following:
//      label            - String, contains the layer name, if included overrides the default label mapping
//      projection       - String, contains the projection of the layer (OSMTILE, WGS84, CBMTILE, APSTILE), defaults to OSMTILE
//      caption          - Function | String, function accepts one argument being the feature object which produces the featurecaption string OR a string that is the name of the property that will be mapped to featurecaption
//      properties       - Function | String | HTMLElement, a function which maps the geojson feature to an HTMLElement or a string that will be parsed as an HTMLElement or an HTMLElement
//      geometryFunction - Function, A function you supply that can add classes, hyperlinks and spans to the created <map-geometry> element, default would be the plain map-geometry element
// geojson2mapml: geojson Object <layer-> -> <layer->
function geojson2mapml(json, options = {}, layer = null) {
    let defaults = {
        label: null,
        projection: "OSMTILE",
        caption: null,
        properties: null,
        geometryFunction: null
    };
    // assign default values for undefined options
    options = Object.assign({}, defaults, options);

    // If string json is received
    if (typeof json === "string") {
        json = JSON.parse(json);
    }
    let geometryType = ["POINT", "LINESTRING", "POLYGON", "MULTIPOINT", "MULTILINESTRING", "MULTIPOLYGON", "GEOMETRYCOLLECTION"];
    let jsonType = json.type.toUpperCase();
    let out = "";

    // HTML parser
    let parser = new DOMParser();

    // initializing layer
    if (layer === null) {
        // creating an empty mapml layer
        let xmlStringLayer = "<layer- label='' checked><map-meta name='projection' content='" + options.projection + "'></map-meta><map-meta name='cs' content='gcrs'></map-meta></layer->";
        layer = parser.parseFromString(xmlStringLayer, "text/html");
        //console.log(layer)
        if (options.label !== null) {
            layer.querySelector("layer-").setAttribute("label", options.label);
        } else if (json.name) {
            layer.querySelector("layer-").setAttribute("label", json.name);
        } else if (json.title) {
            layer.querySelector("layer-").setAttribute("label", json.title);
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

    let feature = "<map-feature><map-featurecaption></map-featurecaption><map-geometry></map-geometry><map-properties></map-properties></map-feature>";
    feature = parser.parseFromString(feature, "text/html");

    // Template to add coordinates to Geometries
    let coords = "<map-coordinates></map-coordinates>";
    coords = parser.parseFromString(coords, "text/html");
    
    //console.log(layer);
    if (jsonType === "FEATURECOLLECTION") {
        
        // Setting bbox if it exists
        if (json.bbox) {
            layer.querySelector("layer-").insertAdjacentHTML("afterbegin", "<map-meta name='extent' content='top-left-longitude=" + json.bbox[0] + ", top-left-latitude=" + json.bbox[1] + ", bottom-right-longitude=" + json.bbox[2] + ",bottom-right-latitude=" + json.bbox[3] + "'></map-meta>");
        }

        let features = json.features;
        //console.log("Features length - " + features.length);
        for (let l=0;l<features.length;l++) {
            geojson2mapml(features[l], options, layer);
        }
    } else if (jsonType === "FEATURE") {

        let clone_feature = feature.cloneNode(true);
        let curr_feature = clone_feature.querySelector('map-feature');
        
        // Setting bbox if it exists
        if (json.bbox) {
            layer.querySelector("layer-").insertAdjacentHTML("afterbegin", "<map-meta name='extent' content='top-left-longitude=" + json.bbox[0] + ", top-left-latitude=" + json.bbox[1] + ", bottom-right-longitude=" + json.bbox[2] + ",bottom-right-latitude=" + json.bbox[3] + "'></map-meta>");
        }

        // Setting featurecaption
        let featureCaption = layer.querySelector("layer-").getAttribute('label');
        if (typeof options.caption === "function") {
            featureCaption = options.caption(json);
        } else if (typeof options.caption === "string") {
            featureCaption = json.properties[options.caption];
            // if property does not exist
            if (featureCaption === undefined) {
                featureCaption = options.caption;
            }
        }
        curr_feature.querySelector("map-featurecaption").innerHTML = featureCaption;

        // Setting Properties
        let p;
        // if properties function is passed
        if (typeof options.properties === "function") {
            p = options.properties(json);
            // if function output is not an element, ignore the properties.
            if (!(p instanceof Element)) {
                p = false;
                console.error("options.properties function returns a string instead of an HTMLElement.");
            }
        } else if (typeof options.properties === "string") { // if properties string is passed
            curr_feature.querySelector('map-properties').insertAdjacentHTML("beforeend", options.properties);
            p = false;
        } else if (options.properties instanceof HTMLElement) { // if an HTMLElement is passed - NOT TESTED
            p = options.properties;
        } else { // If no properties function, string or HTMLElement is passed
            p = properties2Table(json.properties);
        }
        
        if (p) {
            curr_feature.querySelector('map-properties').appendChild(p);
        }

        // Setting map-geometry
        let g = geojson2mapml(json.geometry, options, layer);
        if (typeof options.geometryFunction === "function") {
            curr_feature.querySelector('map-geometry').appendChild(options.geometryFunction(g, json));
        } else {
            curr_feature.querySelector('map-geometry').appendChild(g);
        }
        
        // Appending feature to layer
        layer.querySelector('layer-').appendChild(curr_feature);
        
    } else if (geometryType.includes(jsonType)) {
        //console.log("Geometry Type - " + jsonType);
        switch(jsonType){
            case "POINT":
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

            case "LINESTRING":
                let clone_linestring = linestring.cloneNode(true);
                let linestring_coordindates = clone_linestring.querySelector("map-coordinates");
                
                out = "";

                for (let x=0;x<json.coordinates.length;x++) {
                    out = out + json.coordinates[x][0] + " " + json.coordinates[x][1] + " ";
                }

                linestring_coordindates.innerHTML = out;
                //console.log(clone_linestring.querySelector('map-linestring'));
                return (clone_linestring.querySelector('map-linestring'));

            case "POLYGON":
                let clone_polygon = polygon.cloneNode(true);
                clone_polygon = clone_polygon.querySelector("map-polygon");
                
                // Going over each coordinates
                for (let y=0;y<json.coordinates.length;y++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");

                    // Going over coordinates for the polygon
                    for (let x=0;x<json.coordinates[y].length;x++) {
                        out = out + json.coordinates[y][x][0] + " " + json.coordinates[y][x][1] + " ";
                    }

                    // Create map-coordinates element and append it to clone_polygon
                    clone_coords.innerHTML = out;

                    clone_polygon.appendChild(clone_coords);
                }
                //console.log(clone_polygon);
                return clone_polygon;

            case "MULTIPOINT":
                out = "";
                // Create multipoint element
                let clone_multipoint = multiPoint.cloneNode(true);
                clone_multipoint = clone_multipoint.querySelector('map-multipoint');

                for (let i=0;i<json.coordinates.length;i++) {
                    out = out + json.coordinates[i][0] + " " + json.coordinates[i][1] + " ";
                }
                clone_multipoint.querySelector('map-coordinates').innerHTML = out;
                return clone_multipoint;

            case "MULTILINESTRING":
                let clone_multilinestring = multilinestring.cloneNode(true);
                clone_multilinestring = clone_multilinestring.querySelector("map-multilinestring");

                for(let i=0;i<json.coordinates.length;i++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");
                    for(let y=0;y<json.coordinates[i].length;y++) {
                        out = out + json.coordinates[i][y][0] + " " + json.coordinates[i][y][1] + " ";
                    }
                    clone_coords.innerHTML = out;
                    clone_multilinestring.appendChild(clone_coords);
                }
                return clone_multilinestring;

            case "MULTIPOLYGON":
                let m = multiPolygon.cloneNode(true);
                m = m.querySelector('map-multiPolygon');

                // Going over each Polygon
                for (let i=0;i<json.coordinates.length;i++) {
                    let clone_polygon = polygon.cloneNode(true);
                    clone_polygon = clone_polygon.querySelector("map-polygon");
                    
                    // Going over each coordinates
                    for (let y=0;y<json.coordinates[i].length;y++) {
                        let out = "";
                        let clone_coords = coords.cloneNode(true);
                        clone_coords = clone_coords.querySelector("map-coordinates");

                        // Going over coordinates for the polygon
                        for (let x=0;x<json.coordinates[i][y].length;x++) {
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
                for (let i=0;i<json.geometries.length;i++) {
                    let fg = geojson2mapml(json.geometries[i], options, layer);
                    g.appendChild(fg);
                }
                return g;
        }
    }
    return layer.querySelector('layer-');
}

// Takes an array of length n to return an array of arrays with length 2, helper function
//    for mapml2geojson
// breakArray: arr(float) -> arr(arr(float, float))
function breakArray(arr) {
    let size = 2; 
    let arrayOfArrays = [];
    // removing anything other than numbers, ., - (used to remove <map-span> tags)
    arr = arr.filter(x => !(/[^\d.-]/g.test(x))).filter(x => x);
    for (let i=0; i<arr.length; i+=size) {
        arrayOfArrays.push((arr.slice(i,i+size)).map(Number));
    }
    return arrayOfArrays;
}

// Takes an HTML Table to return geojson properties, helper function
//    for mapml2geojson
// table2properties: HTML Table -> geojson
function table2properties(table) {
    // removing thead, if it exists
    let head = table.querySelector("thead");
    if (head !== null) {
        table.querySelector("thead").remove();
    }
    let json = {};
    table.querySelectorAll('tr').forEach((tr) => {
        let tableData = tr.querySelectorAll('th, td');
        json[tableData[0].innerHTML] = tableData[1].innerHTML;
    });
    return json;
}

// Converts a geometry element to geojson, helper function
//    for mapml2geojson
// geometry2geojson: (child of <map-geometry>), Proj4, Proj4, Bool -> geojson
function geometry2geojson(el, source, dest, transform) {
    let elem = el.nodeName;
    let j = {};
    let coord;

    switch(elem.toUpperCase()) {
        case "MAP-POINT":
            j.type = "Point";
            if (transform) {
                let pointConv = proj4.transform(source, dest, ((el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g)).map(Number)) );
                j.coordinates = [pointConv.x, pointConv.y];
            } else {
                j.coordinates = (el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g)).map(Number);
            }
            break;
        case "MAP-LINESTRING":
            j.type = "LineString";
            coord = el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g);
            coord = breakArray(coord);
            if (transform) {
                coord = pcrsToGcrs(coord, source, dest);
            }
            j.coordinates = coord;
            break;
        case "MAP-POLYGON":
            j.type = "Polygon";
            j.coordinates = [];
            let x = 0;
            el.querySelectorAll('map-coordinates').forEach((coord) => {
                coord = coord.innerHTML.split(/[<>\ ]/g);
                coord = breakArray(coord);
                if (transform) {
                    coord = pcrsToGcrs(coord, source, dest);
                }
                j.coordinates[x] = coord;
                x++;
            });
            break;
        case "MAP-MULTIPOINT":
            j.type = "MultiPoint";
            coord = breakArray(el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g));
            if (transform) {
                coord = pcrsToGcrs(coord, source, dest);
            }
            j.coordinates = coord;
            break;
        case "MAP-MULTILINESTRING":
            j.type = "MultiLineString";
            j.coordinates = [];
            let i = 0;
            el.querySelectorAll('map-coordinates').forEach((coord) => {
                coord = coord.innerHTML.split(/[<>\ ]/g);
                coord = breakArray(coord);
                if (transform) {
                    coord = pcrsToGcrs(coord, source, dest);
                }
                j.coordinates[i] = coord;
                i++;
            });
            break;
        case "MAP-MULTIPOLYGON":
            j.type = "MultiPolygon";
            j.coordinates = [];
            let p = 0;
            el.querySelectorAll('map-polygon').forEach((poly) => {
                let y = 0;
                j.coordinates.push([]);
                poly.querySelectorAll('map-coordinates').forEach((coord) => {
                    coord = coord.innerHTML.split(/[<>\ ]/g);
                    coord = breakArray(coord);
                    if (transform) {
                        coord = pcrsToGcrs(coord, source, dest);
                    }
                    j.coordinates[p].push([]);
                    j.coordinates[p][y] = coord;
                    y++;
                });
                p++;
            });
            break;
    }
    return j;
}

// pcrsToGcrs: arrof([x,y]) Proj4, Proj4 -> arrof[x,y]
function pcrsToGcrs (arr, source, dest) {
    let newArr = [];
    for (let i=0; i<arr.length; i++) {
        let conv = proj4.transform(source, dest, arr[i]);
        conv = [conv.x, conv.y];
        newArr.push(conv);
    }
    return newArr;
}

// Takes an <layer-> element and returns a geojson feature collection object 
// The options object can contain the following:
//      propertyFunction   - function(<map-properties>), A function that maps the features' <map-properties> element to a GeoJSON "properties" member.
//      transform          - Bool, Transform coordinates to gcrs values, defaults to True
// mapml2geojson: <layer-> Object -> GeoJSON
function mapml2geojson(element, options = {}) {
    let defaults = {
        propertyFunction: null,
        transform: true
    };
    // assign default values for undefined options
    options = Object.assign({}, defaults, options);

    let json = {};
    json.type = "FeatureCollection";
    json.title = element.getAttribute('label');
    json.features = [];

    // Transforming Coordinates to gcrs if transformation = true and coordinate is not (EPSG:3857 or EPSG:4326)
    let source = null;
    let dest = null;
    if (options.transform) {
        source = new proj4.Proj(element.parentElement._map.options.crs.code);
        dest = new proj4.Proj('EPSG:4326');
        if (element.parentElement._map.options.crs.code === "EPSG:3857" || element.parentElement._map.options.crs.code === "EPSG:4326") {
            options.transform = false;
        }   
    }

    // Setting all meta settings, if any
    let metas = element.querySelectorAll("map-meta");
    metas.forEach((meta) => {
        let name = meta.getAttribute('name');
        if (name === "extent") {
            let content = meta.getAttribute('content');
            let arr = content.split(",");
            let ex = {};
            for (let i=0; i<arr.length; i++) {
                let s = arr[i].split("=");
                s[0] = s[0].trim(); // removing whitespace
                s[1] = parseFloat(s[1]);
                ex[s[0]] = s[1];
            }
            json.bbox = [ex['top-left-longitude'], ex['top-left-latitude'], ex['bottom-right-longitude'], ex['bottom-right-latitude']];
        }
    });

    // Iterating over each feature
    let features = element.querySelectorAll("map-feature");
    let num = 0;

    // Going over each feature in the layer
    features.forEach((feature) => {
        //console.log(feature);

        json.features[num] = {"type": "Feature"};
        json.features[num].geometry = {};
        json.features[num].properties = {};

        // setting properties when function presented
        if (typeof options.propertyFunction === "function") {
            let properties = options.propertyFunction(feature.querySelector("map-properties"));
            json.features[num].properties = properties;
        } else if (feature.querySelector("map-properties").querySelector('table') !== null) { 
            // setting properties when table presented
            let properties = table2properties(feature.querySelector("map-properties").querySelector('table'));
            json.features[num].properties = properties;
        } else {
            // when no table present, strip any possible html tags to only get text
            json.features[num].properties = {prop0: (feature.querySelector("map-properties").innerHTML).replace( /(<([^>]+)>)/ig, '')};
        }

        let geom = feature.querySelector("map-geometry");
        let elem = geom.children[0].nodeName;

        // Adding Geometry
        if (elem.toUpperCase() !== "MAP-GEOMETRYCOLLECTION"){
            json.features[num].geometry = geometry2geojson(geom.children[0], source, dest, options.transform);
        } else {
            json.features[num].geometry.type = "GeometryCollection";
            json.features[num].geometry.geometries = [];
            
            let geoms = geom.querySelector('map-geometrycollection').children;
            Array.from(geoms).forEach((g) => {
                g = geometry2geojson(g, source, dest, options.transform);
                json.features[num].geometry.geometries.push(g);
            });
        }
        //going to next feature
        num++;
    });
    
    return json;
}
