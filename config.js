define(function () {
    return {
        getSettings: function () {
            return {
                uses: "settings",
                items: {
                    map: {
                        type: "items",
                        label: "Map options",
                        items: {
                            torqueType: {
                                ref: "torqueType",
                                type: "string",
                                component: "dropdown",
                                label: "Map type",
                                options: [
                                    {
                                        value: "normal",
                                        label: "Normal"
                                    },
                                    {
                                        value: "categories",
                                        label: "Categories"
                                    },
                                    {
                                        value: "heatmap",
                                        label: "Heatmap"
                                    }
                                ],
                                defaultValue: "normal"
                            },
                            basemap: {
                                ref: "basemap",
                                type: "string",
                                component: "dropdown",
                                label: "Change basemap",
                                options: [{
                                    value: "dark",
                                    label: "Dark"
                                }, {
                                    value: "light",
                                    label: "Light"
                                }],
                                defaultValue: "dark"
                            },
                            autoplay: {
                                ref: "autoplay",
                                type: "boolean",
                                label: "Autoplay",
                                defaultValue: true
                            },
                            loop: {
                                ref: "loop",
                                type: "boolean",
                                label: "Loop animations",
                                defaultValue: true
                            }
                        }
                    },
                    style: {
                        type: "items",
                        label: "Map style",
                        items: {
                            markerFill: {
                                ref: "markerFill",
                                label: "Marker fill (normal only)",
                                type: "integer",  
                                component: "color-picker",  
                                defaultValue: 10
                            },
                            markerWidth: {
                                ref: "markerWidth",
                                type: "integer",
                                component: "dropdown",
                                label: "Marker width",
                                options: [
                                    {
                                        value: 0,
                                    },
                                    {
                                        value: 1,
                                    },
                                    {
                                        value: 2,
                                    },
                                    {
                                        value: 3,
                                    },
                                    {
                                        value: 4,
                                    },
                                    {
                                        value: 5,
                                    },
                                    {
                                        value: 6,
                                    },
                                    {
                                        value: 7,
                                    },
                                    {
                                        value: 8,
                                    },
                                    {
                                        value: 9,
                                    },
                                    {
                                        value: 10,
                                    }
                                ],
                                defaultValue: 2
                            },
                            markerOpacity: {
                                ref: "markerOpacity",
                                type: "number",
                                component: "dropdown",
                                label: "Marker opacity",
                                options: [
                                    {
                                        value: 0,
                                    },
                                    {
                                        value: 0.1,
                                    },
                                    {
                                        value: 0.2,
                                    },
                                    {
                                        value: 0.3,
                                    },
                                    {
                                        value: 0.4,
                                    },
                                    {
                                        value: 0.5,
                                    },
                                    {
                                        value: 0.6,
                                    },
                                    {
                                        value: 0.7,
                                    },
                                    {
                                        value: 0.8,
                                    },
                                    {
                                        value: 0.9,
                                    },
                                    {
                                        value: 1,
                                    }
                                ],
                                defaultValue: 0.2
                            },
                            borderColor: {
                                ref: "borderColor",
                                label: "Border color (except heatmap)",
                                type: "integer",  
                                component: "color-picker",  
                                defaultValue: 10
                            },
                            borderStroke: {
                                ref: "borderWidth",
                                type: "integer",
                                component: "dropdown",
                                label: "Border stroke (except heatmap)",
                                options: [
                                    {
                                        value: 0,
                                    },
                                    {
                                        value: 1,
                                    },
                                    {
                                        value: 2,
                                    },
                                    {
                                        value: 3,
                                    },
                                    {
                                        value: 4,
                                    },
                                    {
                                        value: 5,
                                    },
                                    {
                                        value: 6,
                                    },
                                    {
                                        value: 7,
                                    },
                                    {
                                        value: 8,
                                    },
                                    {
                                        value: 9,
                                    },
                                    {
                                        value: 10,
                                    }
                                ],
                                defaultValue: 0
                            },
                            borderOpacity: {
                                ref: "borderOpacity",
                                type: "number",
                                component: "dropdown",
                                label: "Border opacity",
                                options: [
                                    {
                                        value: 0,
                                    },
                                    {
                                        value: 0.1,
                                    },
                                    {
                                        value: 0.2,
                                    },
                                    {
                                        value: 0.3,
                                    },
                                    {
                                        value: 0.4,
                                    },
                                    {
                                        value: 0.5,
                                    },
                                    {
                                        value: 0.6,
                                    },
                                    {
                                        value: 0.7,
                                    },
                                    {
                                        value: 0.8,
                                    },
                                    {
                                        value: 0.9,
                                    },
                                    {
                                        value: 1,
                                    }
                                ],
                                defaultValue: 1
                            },
                            cumulative: {
                                ref: "cumulative",
                                type: "boolean",
                                label: "Cumulative",
                                defaultValue: false
                            }
                        }
                    },
                    advanced: {
                        type: "items",
                        label: "Advanced options",
                        items: {
                            categoryColors: {
                                ref: "categoryColors",
                                type: "string",
                                label: "Category colors (comma-separated)",
                                defaultValue: ""
                            },
                            animationDuration: {
                                ref: "animationDuration",
                                type: "number",
                                label: "Animation duration (s)",
                                defaultValue: 30
                            },
                            steps: {
                                ref: "steps",
                                type: "integer",
                                label: "Animation steps",
                                defaultValue: 512
                            },
                            zoom: {
                                ref: "zoom",
                                type: "integer",
                                label: "Initial zoom level",
                                defaultValue: 0
                            },
                            center_lat: {
                                ref: "centerLat",
                                type: "number",
                                label: "Initial center latitude",
                                defaultValue: 0
                            },
                            center_lon: {
                                ref: "centerLon",
                                type: "number",
                                label: "Initial center longitude",
                                defaultValue: 0
                            }
                        }
                    }
                }
            }
        }
    }
});