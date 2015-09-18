/*
 * This extension displays a Torque map using Qlik's hypercube to interact with data stored there.
 *
 * The extension requires you to define at least one dimension with the location (GeoMakePoint).
 * Different combinations are:
 *   - One dimension (location): displays a static map.
 *   - One dimension (location) and a measure: displays a static map that aggregates values (sum).
 *     This is not a very special case, as aggregation is supposed to happen in Qlik, with nothing
 *     left to aggregate in Torque. So typically the results are the same as above. However, if map
 *     type is "categories", of course the measure will be used to detect the category. 
 *   - Two dimensions (location and time): displays an animated map.
 *   - Two dimensions (location and time) and a measure: same as above, it only makes real sense for
 *     category maps.
 */
define(["./lib/leaflet", "./cartocss", "./config", "text!./cartodb.css", "text!./torque.css", "text!./lib/leaflet.css", "./lib/torque.full"], function (L, cartocss, config, cartodbCSS, cssTorque, cssLeaflet, torque) {
    $("<style>").html(cssTorque).appendTo("head");
    $("<style>").html(cssLeaflet).appendTo("head");
    $("<style>").html(cartodbCSS).appendTo("head");
    
    // Store the configuration of the map, coming from Qlik's menus, and track changes there.
    var mapOptions = {};

    // We try to use the same map always, where as the torque layer is new on every paint call, as changing
    // torque configuration on the fly is not easy when you're not using CartoCSS for that.
    var map;
    var basemapLayer;
    var torqueLayer;

    // To be able to bind/unbind callback functions.
    var updateSlider;
    var updateSelections;
    var hideSpinner;

    // Extension is called for the first time after page reload
    var initialPageLoad = true;

    var dragging = false;
    
    return {
        initialProperties: {
            version: 0.1,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 3,  // (location, timestamp, value) or a subset
                    qHeight: 3000
                }]
            }
        },

        // Property panel
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 2
                },
                measures: {
                    uses: "measures",
                    min: 0,
                    max: 1
                },
                settings: config.getSettings()
            }
        },

        // Object rendering
        paint: function ($element, layout, dontRedraw) {
            $("#spinner").show();

            var self = this;

            // Force map redraw, necessary to deal with map size / zoom changes done by the user on Qlik's UI.
            if (map && !dontRedraw) {
                map._onResize();
            }
            
            // Load all the data available in the hypercube, as hacky and sloppy as it gets.
            // I'm sure there has to be a better way, but this is the best I've found that works in all cases.
            var lastrow = 0;
            var data = [];

            this.backendApi.eachDataRow(function (rownum, row) {
                lastrow = rownum;
                data.push(row);
            });

            if (lastrow < this.backendApi.getRowCount() - 1) {
                var requestPage = [{
                    qTop: lastrow + 1,
                    qLeft: 0,
                    qWidth: 3,
                    qHeight: Math.min(3000, this.backendApi.getRowCount() - lastrow)
                }];
                this.backendApi.getData(requestPage).then(function (dataPages) {
                    self.paint($element, layout, true);
                });
                return;
            }
            
            // This code is reached if and only if all the data has been loaded. Now the fun begins.

            var animated = layout.qHyperCube.qDimensionInfo.length >= 2 ? true : false;
            var hasValue = layout.qHyperCube.qMeasureInfo.length >= 1 ? true : false;

            // Depending on the number of dimensions / measures, data from the hypercube comes in this order:
            // One dimension (animated = false, hasValue = false): (dimension1)
            // One dimension and one measure (animated = false, hasValue = true): (dimension1, measure1)
            // Two dimensions (animated = true, hasValue = false): (dimension1, dimension2)
            // Two dimensions and one measure (animated = true, hasValue = true): (dimension1, dimension2, measure1)
            var locationIdx = 0;  // TODO: verify date doesn't come first
            if (animated) {
                var dateIdx = 1;
            }
            if (hasValue) {
                var valueIdx = animated ? 2 : 1;
            }

            // If there is no html yet, we assume this is the first time the extension is called, either after
            // being added to the app or on page reload.
            if (!$element.html()) {
                $element.html('' +
                    '<div id="spinner" class="Loader">' +
                    '    <div class="Spinner"></div>' +
                    '</div>' +
                    '<div id="map">' +
                    '    <div class="mapLayer" id="filter">' +
                    '        <p>Area filter</p>' +
                    '        <input type="checkbox" class="toogle" name="dynamic_filter" id="dynamic_filter">' +
                    '    </div>' +
                    '</div>' +
                    '<div id="container">' +
                    '    <ul>' +
                    '        <li class="container-action">' +
                    '            <a href="https://cartodb.com/solutions/qlik">' +
                    '                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAclJREFUSA3VlzFLA0EQhe80BC2sRNDSLp2dIApaCVb+BC1tbBQrW4vUIthKWsHCSrESLUQsRdBCsDBJYUARC0E9vwm33uVyyc1uSIIDj5mdnZmX3Z3sJl4QBHlQBGXQbREO4cp7odFtwmT9oo+n7HneBOilVIQ46CWj4RowRq/1vyU+YaemwIP1jiXbzWJ8RuygEKLXLfLqoZ00V8H3/fuQeAT9DESrxPaMf6h6DE4NqbBgv6MOxNaKDfE5RWWVy+irFII9fC8p/nSX8mwOicuZCthLYMiM4xr/BsgUaYwseSWg6ezwjQM/Tio2vhy4Bm1Fs9U34Rk2cOCrgqZbD98XgfsNwSkDDfFbSl6W6y4rQEOsb5iIbSwy0y0N8QqHtZqe3tI723LGTLTtgGjyE3PR5CQ1c3JzLYgfPQwyf1RoViz18uCIgjMyiAu+bcaTYC7076Cz33cSbaRGcCEkkNVtgTVwCUbBJlCJy139CLG8SB+gBuS+vgDzYBqoxIVYCsv39BbsgvoLhbYS7Rkni8oqq+A7OaEd/92/2oQw7gktj780nZO4brUTWTzJdavjNZzsvhJXnD5yZ0kVWXGpsxpO2SW5ffryp+0XLlaMejDd+O4AAAAASUVORK5CYII="/>' +
                    '                <span>Analyze your data</span>' +
                    '            </a>' +
                    '        </li>' +
                    '        <li class="container-timeline">' +
                    '            <div class="timeline-date">' +
                    '                <p></p>' +
                    '            </div>' +
                    '            <div class="timeline-bar">' +
                    '                <div id="control"><span class="pause"></span></div>' +
                    '                <div class="timeline-inner">' +
                    '                    <div class="timeline-progress">' +
                    '                        <span></span>' +
                    '                    </div>' +
                    '                </div>' +
                    '            </div>' +
                    '        </li>' +
                    '    </ul>' +
                    '</div>');

                // This is the only moment where we want to instantiate a new map.
                if (map && updateSelections) {
                    map.off('zoomend', updateSelections);
                }
                map = new L.Map('map', {
                    zoomControl: true
                });

                // This takes care of narrowing the data filter on Qlik based on the current bounding box.
                updateSelections = function () {
                    if ($("#dynamic_filter").is(':checked')) {
                        var mapBounds = map.getBounds();
                        
                        var points = [];

                        for (var i = 0; i < data.length; i++) {
                            var location = data[i][locationIdx];
                            var lonlat = JSON.parse(location.qText);
                            var point = L.latLng(parseFloat(lonlat[1]), parseFloat(lonlat[0]));
                            
                            if (mapBounds.contains(point)) {
                                points.push(location.qElemNumber);
                            }
                        }

                        self.backendApi.selectValues(locationIdx, points, false);
                    }
                }
                map.on('zoomend', updateSelections);

                // Make filter do its job simply by clicking on the filter button.
                $("#dynamic_filter").click(function () {
                    if ($(this).is(':checked')) {
                        updateSelections();
                    }
                });

                // Play / pause button.
                $('#control').click(function () {
                    if (torqueLayer.isRunning()) {
                        torqueLayer.pause();
                        $("#control span").removeClass("pause");
                        $("#control span").addClass("play");
                    } else {
                        torqueLayer.play();
                        $("#control span").removeClass("play");
                        $("#control span").addClass("pause");
                    }
                });

                // Make Torque respond to timeline events
                var setTorqueStepFromOffset = function (offsetX) {
                    offsetX += $(".timeline-progress span").width();
                    if (!torqueLayer.isRunning()) {  // Torque's change:time is not triggered in this case
                        $(".timeline-progress").width(offsetX);
                    }
                    torqueLayer.setStep(parseInt(layout.steps * offsetX / $('.timeline-inner').width()));
                };

                $('.timeline-inner').click(function (e) {
                    if (e.target != $(this)) {  // No click event if clicked in inner span
                        setTorqueStepFromOffset(e.offsetX);
                    }
                });
                $('.timeline-progress span').mousedown(function (e) {
                    dragging = true;
                    $(".timeline-inner").css("cursor", "grabbing");
                });
                $('.timeline-progress span').mouseup(function (e) {
                    dragging = false;
                    $(".timeline-inner").css("cursor", "grab");
                });
                $('.timeline-progress span').mouseenter(function (e) {
                    $(".timeline-inner").css("cursor", "grab");
                });
                $('.timeline-progress span').mouseleave(function (e) {
                    dragging = false;
                    $(".timeline-inner").css("cursor", "pointer");
                });
                $('.timeline-progress span').mousemove(function (e) {
                    if (dragging) {
                        setTorqueStepFromOffset($(this).position().left + e.offsetX + e.originalEvent.movementX);
                    }
                });
            }

            // Torque layer is always created from scratch every time paint is called, so let's remove any previous one.
            if (torqueLayer) {
                map.removeLayer(torqueLayer);
                torqueLayer.off('change:time', updateSlider);
                torqueLayer.off('tilesLoaded', hideSpinner);
                torqueLayer = null;
            }

            if (mapOptions.basemap != layout.basemap) {
                mapOptions.basemap = layout.basemap;

                if (basemapLayer) {
                    map.removeLayer(basemapLayer);
                }

                basemapLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/' + mapOptions.basemap + '_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                });
                map.addLayer(basemapLayer);
            }

            torqueLayer = new L.TorqueLayer({
                provider: 'internal',
                loop: true,
                steps: animated ? layout.steps : 1,
                animationDuration: layout.animationDuration,
                data_aggregation: layout.cumulative ? "cumulative" : undefined,
                countby: layout.torqueType == "categories" ? "CDB_Math_Mode(value)" : undefined,
                cartocss: cartocss.get(layout.torqueType, layout, animated)
            });
            map.addLayer(torqueLayer);

            updateSlider = function (event) {
                if (animated) {
                    $(".timeline-date p").html(event.time.toLocaleString());
                    var width = parseInt(event.step * 100 / parseInt(layout.steps));
                    $(".timeline-progress").width(width + "%");
                }
            }
            torqueLayer.on('change:time', updateSlider);

            hideSpinner = function () {
                $("#spinner").hide();
            }
            torqueLayer.on('tilesLoaded', hideSpinner);

            // This step can actually be removed, as it takes time and it's only made for code readability's sake.
            var dataBounds = [[], []];
            var torqueData = data.map(function (d) {
                try {
                    var lonlat = JSON.parse(d[locationIdx].qText);
                    var longitude = parseFloat(lonlat[0]);
                    var latitude = parseFloat(lonlat[1]);
                    if (!layout.zoom && !layout.centerLat && !layout.centerLon) {
                        if (dataBounds[1][0] == undefined || latitude > dataBounds[1][0]) dataBounds[1][0] = latitude;
                        if (dataBounds[0][0] == undefined || latitude < dataBounds[0][0]) dataBounds[0][0] = latitude;
                        if (dataBounds[1][1] == undefined || longitude > dataBounds[1][1]) dataBounds[1][1] = longitude;
                        if (dataBounds[0][1] == undefined || longitude < dataBounds[0][1]) dataBounds[0][1] = longitude;
                    }
                    return {
                        "date": animated ? d[dateIdx].qText : 0,
                        "latitude": latitude,
                        "longitude": longitude,
                        "value": hasValue ? (d[valueIdx].qNum == NaN || d[valueIdx].qNum == "NaN" ? d[valueIdx].qText : d[valueIdx].qNum) : 1
                    }
                } catch (err) {
                    return;
                }
            });

            // When loading for the first time, we need to either fit bounds or go to zomm/lat/lon as specified by the user in the menu.
            if (initialPageLoad) {
                initialPageLoad = false;
                if (!layout.zoom && !layout.centerLat && !layout.centerLon) {
                    map.fitBounds(dataBounds);
                } else {
                    map.setView([layout.centerLat, layout.centerLon], layout.zoom);
                }
            }

            // Actually loading data into Torque.
            for (var i = 0; i < torqueData.length; i++) {
                var point = torqueData[i];
                if (point) {
                    torqueLayer.provider.addPoint(point.latitude, point.longitude, point.date, point.value);
                }
            }

            // If this is a category map, we need to update the CartoCSS and create a legend
            $(".cartodb-legend-stack").remove();
            if (layout.torqueType == "categories" && hasValue) {
                var torqueCategories = torqueLayer.provider.getCategories();
                torqueLayer.setCartoCSS(cartocss.get(layout.torqueType, layout, animated, torqueCategories, layout.categoryNames, layout.categoryColors));
                var legendHTML = '<div class="cartodb-legend-stack" style="display: block;"><div class="cartodb-legend category" style="display: block;"><ul>';
                for (var i = 0; i < torqueCategories.length; i++) {
                    legendHTML += '<li><div class="bullet" style="background: ' + torqueCategories[i].color + '"></div>' + torqueCategories[i].name + '</li>';
                }
                legendHTML += '</ul></div></div>';
                $("#map").append(legendHTML);
            }

            // Let's rock!
            torqueLayer.provider.setReady();

            if (animated) {
                torqueLayer.play();
                $('.timeline-date').show();
                $('.timeline-bar').show();
            } else {
                $('.timeline-date').hide();
                $('.timeline-bar').hide();
            }
        }
    }
});
