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
                            zoom: {
                                ref: "zoom",
                                type: "integer",
                                label: "Initial zoom level",
                                defaultValue: 5
                            },
                            center_lat: {
                                ref: "centerLat",
                                type: "number",
                                label: "Initial center latitude",
                                defaultValue: 40
                            },
                            center_lon: {
                                ref: "centerLon",
                                type: "number",
                                label: "Initial center longitude",
                                defaultValue: 0
                            }
                        }
                    },
                    torque: {
                        type: "items",
                        label: "Map style",
                        items: {
                            torqueType: {
                                ref: "torqueType",
                                type: "string",
                                component: "dropdown",
                                label: "Torque type",
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
                            cumulative: {
                                ref: "cumulative",
                                type: "boolean",
                                label: "Cumulative",
                                defaultValue: false
                            },
                            markerFill: {
                                ref: "markerFill",
                                type: "string",
                                label: "Marker fill (normal only)",
                                defaultValue: "#ff6600"
                            },
                            markerWidth: {
                                ref: "markerWidth",
                                type: "integer",
                                label: "Marker width",
                                defaultValue: 2
                            },
                            categoryNames: {
                                ref: "categoryNames",
                                type: "string",
                                label: "Category names (,-sep)",
                                defaultValue: ""
                            },
                            categoryColors: {
                                ref: "categoryColors",
                                type: "string",
                                label: "Category colors (,-sep)",
                                defaultValue: ""
                            }
                        }
                    }
                }
            }
        }
    }
});