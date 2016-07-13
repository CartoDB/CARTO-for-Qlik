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
                    '            <a href="https://carto.com/connectors/qlik/">' +
                    '                <img style="height: 30px" src="data:image/png;base64,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"/>' +
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
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                });
                map.addLayer(basemapLayer);
            }

            torqueLayer = new L.TorqueLayer({
                provider: 'internal',
                loop: layout.loop,
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
                if (layout.autoplay) {
                    torqueLayer.play();
                    $("#control span").removeClass("play");
                    $("#control span").addClass("pause");
                } else {
                    $("#control span").removeClass("pause");
                    $("#control span").addClass("play");
                }
                $('.timeline-date').show();
                $('.timeline-bar').show();
            } else {
                $('.timeline-date').hide();
                $('.timeline-bar').hide();
            }
        }
    }
});
