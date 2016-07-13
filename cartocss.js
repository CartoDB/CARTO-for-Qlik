define([], function () {
    var palette = [
        "#b0afae",
        "#7b7a78",
        "#545352",
        "#4477aa",
        "#7db8da",
        "#b6d7ea",
        "#46c646",
        "#f93f17",
        "#ffcf02",
        "#276e27",
        "#ffffff",
        "#000000"
    ];
    return {
        get: function (torqueType, layout, trails, torqueCategories, categoryNames, categoryColors) {
            var markerFill = palette[layout.markerFill];
            var borderColor = palette[layout.borderColor];

            if (torqueType == "heatmap") {
                return [
                    'Map {',
                    '}',
                    '#layer{',
                    '  image-filters: colorize-alpha(blue, cyan, lightgreen, yellow , orange, red);',
                    '  marker-file: url(http://s3.amazonaws.com/com.cartodb.assets.static/alphamarker.png);',
                    '  marker-fill-opacity: ' + layout.markerOpacity + '*[value];',
                    '  marker-width: ' + layout.markerWidth + ';',
                    '}',
                    '#layer[frame-offset=1] {',
                    '  marker-width: ' + (layout.markerWidth + 2) + ';',
                    '  marker-fill-opacity: ' + (layout.markerOpacity / 2) + '; ',
                    '}',
                    '#layer[frame-offset=2] {',
                    '  marker-width: ' + (layout.markerWidth + 4) + ';',
                    '  marker-fill-opacity: ' + (layout.markerOpacity / 4) + '; ',
                    '}'
                ].join('\n');
            } else if (torqueType == "categories") {
                var css = [
                    'Map {',
                    '}',
                    '#layer{',
                    '  comp-op: lighter;',
                    '  marker-line-color: ' + borderColor + ';',
                    '  marker-line-width: ' + layout.borderWidth + ';',
                    '  marker-line-opacity: ' + layout.borderOpacity + ';',
                    '  marker-type: ellipse;',
                    '  marker-width: ' + layout.markerWidth + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-opacity: ' + layout.markerOpacity + ';',
                    '}'].join('\n');
                if (trails) {
                    css += [
                        '#layer::point2 {',
                        '  marker-width: ' + parseInt(layout.markerWidth / 2) + ';',
                        '  marker-fill: ' + markerFill + ';',
                        '  marker-fill-opacity: 1;',
                        '  marker-line-opacity: 0;',
                        '}',
                        '#layer::point3 {',
                        '  marker-width: ' + (layout.markerWidth * 2) + ';',
                        '  marker-fill: ' + markerFill + ';',
                        '  marker-fill-opacity:' + layout.markerOpacity + ';',
                        '  marker-line-opacity: 0;',
                        '}',
                        '#layer::point {',
                        '  marker-width: ' + (layout.markerWidth * 3) + ';',
                        '  marker-fill-opacity: 0;',
                        '  marker-line-color:' + borderColor + ';',
                        '  marker-line-width: 1;',
                        '  marker-line-opacity:' + (layout.borderOpacity / 2) + ';',
                        '}',
                        '#layer[frame-offset=1] {',
                        '  marker-width: ' + layout.markerWidth + ';',
                        '  marker-opacity: 0.45;',
                        '}',
                        '#layer[frame-offset=2]{',
                        '  marker-width: ' + (layout.markerWidth * 2) + ';',
                        '  marker-opacity: 0.225;',
                        '}',
                        '#layer[frame-offset=3]{',
                        '  marker-width: ' + (layout.markerWidth * 3) + ';',
                        '  marker-opacity: 0.1;',
                        '}',
                        '#layer[frame-offset=4]{',
                        '  marker-width: ' + (layout.markerWidth * 4) + ';',
                        '  marker-opacity: 0.05;',
                        '}',
                        '#layer[frame-offset=5]{',
                        '  marker-width: ' + (layout.markerWidth * 5) + ';',
                        '  marker-opacity: 0.02;',
                        '}'
                    ].join('\n');
                }
                if (torqueCategories) {
                    if (categoryNames) {
                        categoryNames = categoryNames.split(",");
                    }
                    if (categoryColors) {
                        categoryColors = categoryColors.split(",");
                    }
                    for (var i = 0; i < torqueCategories.length; i++) {
                        var torqueCategory = torqueCategories[i];
                        if (categoryColors && categoryColors[i] != undefined) {
                            torqueCategory.color = categoryColors[i];
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
                var css = [
                    'Map {',
                    '}',
                    '#layer{',
                    '  comp-op: lighter;',
                    '  marker-line-color: ' + borderColor + ';',
                    '  marker-line-width: ' + layout.borderWidth + ';',
                    '  marker-line-opacity: ' + layout.borderOpacity + ';',
                    '  marker-type: ellipse;',
                    '  marker-width: ' + layout.markerWidth + ';',
                    '  marker-fill: ' + markerFill + ';',
                    '  marker-opacity: ' + layout.markerOpacity + ';',
                    '}'].join("\n");
                if (trails) {
                    css += [
                        '#layer::point2 {',
                        '  marker-width: ' + parseInt(layout.markerWidth / 2) + ';',
                        '  marker-fill: ' + markerFill + ';',
                        '  marker-fill-opacity: 1;',
                        '  marker-line-opacity: 0;',
                        '}',
                        '#layer::point3 {',
                        '  marker-width: ' + (layout.markerWidth * 2) + ';',
                        '  marker-fill: ' + markerFill + ';',
                        '  marker-fill-opacity:' + layout.markerOpacity + ';',
                        '  marker-line-opacity: 0;',
                        '}',
                        '#layer::point {',
                        '  marker-width: ' + (layout.markerWidth * 3) + ';',
                        '  marker-fill-opacity: 0;',
                        '  marker-line-color:' + borderColor + ';',
                        '  marker-line-width: 1;',
                        '  marker-line-opacity:' + (layout.borderOpacity / 2) + ';',
                        '}',
                        '#layer[frame-offset=1] {',
                        '  marker-width: ' + layout.markerWidth + ';',
                        '  marker-opacity: 0.45;',
                        '}',
                        '#layer[frame-offset=2]{',
                        '  marker-width: ' + (layout.markerWidth * 2) + ';',
                        '  marker-opacity: 0.225;',
                        '}',
                        '#layer[frame-offset=3]{',
                        '  marker-width: ' + (layout.markerWidth * 3) + ';',
                        '  marker-opacity: 0.1;',
                        '}',
                        '#layer[frame-offset=4]{',
                        '  marker-width: ' + (layout.markerWidth * 4) + ';',
                        '  marker-opacity: 0.05;',
                        '}',
                        '#layer[frame-offset=5]{',
                        '  marker-width: ' + (layout.markerWidth * 5) + ';',
                        '  marker-opacity: 0.02;',
                        '}'
                    ].join('\n');
                }
                return css;
            }
        }
    };
});