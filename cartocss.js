define(function () {
    return {
        get: function (torqueType, markerWidth, markerFill, torqueCategories, categoryNames, categoryColors) {
            if (torqueType == "heatmap") {
                if (markerWidth == undefined) {
                    markerWidth = 1;
                }
                return [
                    'Map {',
                    '}',
                    '#layer{',
                    '  image-filters: colorize-alpha(blue, cyan, lightgreen, yellow , orange, red);',
                    '  marker-file: url(http://s3.amazonaws.com/com.cartodb.assets.static/alphamarker.png);',
                    '  marker-fill-opacity: 0.2*[value];',
                    '  marker-width: ' + markerWidth + ';',
                    '}',
                    '#layer[frame-offset=1] {',
                    '  marker-width: ' + (markerWidth + 2) + ';',
                    '  marker-fill-opacity:0.1; ',
                    '}',
                    '#layer[frame-offset=2] {',
                    '  marker-width: ' + (markerWidth + 4) + ';',
                    '  marker-fill-opacity:0.05; ',
                    '}'
                ].join('\n');
            } else if (torqueType == "categories") {
                if (markerWidth == undefined) {
                    markerWidth = 1;
                }
                if (markerFill == undefined) {
                    markerWidth = "#DDDDDD";
                }
                var css = [
                    'Map {',
                    '}',
                    '#layer{',
                    '  comp-op: lighter;',
                    '  marker-line-color: #FFF;',
                    '  marker-line-width: 0;',
                    '  marker-line-opacity: 1;',
                    '  marker-type: ellipse;',
                    '  marker-width: ' + markerWidth + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-opacity: 0.1',
                    '}',
                    '#layer::point2 {',
                    '  marker-width: ' + parseInt(markerWidth / 2) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: 1;',
                    '  marker-line-color: #fff;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: 0;',
                    '}',
                    '#layer::point3 {',
                    '  marker-width: ' + (markerWidth * 2) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: .2;',
                    '  marker-line-color: #fff;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: 0;',
                    '}',
                    '#layer::point {',
                    '  marker-width: ' + (markerWidth * 3) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: 0;',
                    '  marker-line-color: #ff6600;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: .1;',
                    '}',
                    '#layer[frame-offset=1] {',
                    '  marker-width: ' + markerWidth + ';',
                    '  marker-opacity:0.45;',
                    '}',
                    '#layer[frame-offset=2]{',
                    '  marker-width: ' + (markerWidth * 2) + ';',
                    '  marker-opacity:0.225;',
                    '}',
                    '#layer[frame-offset=3]{',
                    '  marker-width: ' + (markerWidth * 3) + ';',
                    '  marker-opacity:0.1;',
                    '}',
                    '#layer[frame-offset=4]{',
                    '  marker-width: ' + (markerWidth * 4) + ';',
                    '  marker-opacity:0.05;',
                    '}',
                    '#layer[frame-offset=5]{',
                    '  marker-width: ' + (markerWidth * 5) + ';',
                    '  marker-opacity:0.02;',
                    '}'
                ].join('\n');
                if (torqueCategories) {
                    if (categoryNames) {
                        categoryNames = categoryNames.split(",");
                    }
                    if (categoryColors) {
                        categoryColors = categoryColors.split(",");
                    }

                    for (var i = 0; i < torqueCategories.length; i++) {
                        var torqueCategory = torqueCategories[i];
                        if (categoryNames && categoryNames[torqueCategory.value] != undefined) {
                            torqueCategory.name = categoryNames[torqueCategory.value];
                        }
                        if (categoryColors && categoryColors[torqueCategory.value] != undefined) {
                            torqueCategory.color = categoryColors[torqueCategory.value];
                        }

                        if (typeof(torqueCategory.value) == "number") {
                            css += '\n#layer[value=' + torqueCategory.value + '] { marker-fill: ' + torqueCategory.color + '; }';
                        } else {
                            css += "\n#layer[value='" + torqueCategory.value + "'] { marker-fill: " + torqueCategory.color + "; }";
                        }
                    }
                }
                return css;
            } else {
                if (markerWidth == undefined) {
                    markerWidth = 1;
                }
                if (markerFill == undefined) {
                    markerWidth = "#FFFFFF";
                }
                return [
                    'Map {',
                    '}',
                    '#layer{',
                    '  comp-op: lighter;',
                    '  marker-line-color: #FFF;',
                    '  marker-line-width: 0;',
                    '  marker-line-opacity: 1;',
                    '  marker-type: ellipse;',
                    '  marker-width: ' + markerWidth + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-opacity: 0.1',
                    '}',
                    '#layer::point2 {',
                    '  marker-width: ' + parseInt(markerWidth / 2) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: 1;',
                    '  marker-line-color: #fff;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: 0;',
                    '}',
                    '#layer::point3 {',
                    '  marker-width: ' + (markerWidth * 2) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: .2;',
                    '  marker-line-color: #fff;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: 0;',
                    '}',
                    '#layer::point {',
                    '  marker-width: ' + (markerWidth * 3) + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-fill-opacity: 0;',
                    '  marker-line-color: #ff6600;',
                    '  marker-line-width: 1;',
                    '  marker-line-opacity: .1;',
                    '}',
                    '#layer[frame-offset=1] {',
                    '  marker-width: ' + markerWidth + ';',
                    '  marker-opacity:0.45;',
                    '}',
                    '#layer[frame-offset=2]{',
                    '  marker-width: ' + (markerWidth * 2) + ';',
                    '  marker-opacity:0.225;',
                    '}',
                    '#layer[frame-offset=3]{',
                    '  marker-width: ' + (markerWidth * 3) + ';',
                    '  marker-opacity:0.1;',
                    '}',
                    '#layer[frame-offset=4]{',
                    '  marker-width: ' + (markerWidth * 4) + ';',
                    '  marker-opacity:0.05;',
                    '}',
                    '#layer[frame-offset=5]{',
                    '  marker-width: ' + (markerWidth * 5) + ';',
                    '  marker-opacity:0.02;',
                    '}'
                ].join('\n');
            }
        }
    };
});